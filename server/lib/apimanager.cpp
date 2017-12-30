#include <QUrl>
#include <QStringList>

#include "account.h"
#include "accountmanager.h"
#include "apimanager.h"
#include "bunny.h"
#include "bunnymanager.h"
#include "httprequest.h"
#include "plugininterface.h"
#include "pluginmanager.h"
#include "qjson/serializer.h"

bool ApiManager::isJsonApiCall = false;

ApiManager::ApiManager()
{

}

ApiManager & ApiManager::Instance()
{
  static ApiManager a;
  return a;
}

QByteArray ApiManager::ApiAnswer::GetData()
{
	QString tmp("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
	tmp.append("<api>");
	tmp.append(GetInternalData());
	tmp.append("</api>");
	return tmp.toUtf8();
}

ApiManager::ApiAnswer * ApiManager::ProcessApiCall(QString request, HTTPRequest & hRequest)
{
    isJsonApiCall = false;
    if(request.startsWith("/ojn/FR/api"))
	{
		return ProcessBunnyVioletApiCall(request, hRequest);
	}
	else
	{
        QString format = hRequest.GetArg("fmt");
        if (format == "json")
        {
            isJsonApiCall = true;
        }
        if(request.startsWith("json/"))
        {
            isJsonApiCall = true;
            request = request.mid(strlen("json/"));
        }

		Account const& account = hRequest.HasArg("token")?AccountManager::Instance().GetAccount(hRequest.GetArg("token").toAscii()):AccountManager::Guest();
		hRequest.RemoveArg("token");

		if(request.startsWith("global/"))
			return ProcessGlobalApiCall(account, request.mid(7), hRequest);

		if(request.startsWith("plugins/"))
			return PluginManager::Instance().ProcessApiCall(account, request.mid(8), hRequest);

		if(request.startsWith("plugin/"))
			return ProcessPluginApiCall(account, request.mid(7), hRequest);

		if(request.startsWith("bunnies/"))
			return BunnyManager::Instance().ProcessApiCall(account, request.mid(8), hRequest);

		if(request.startsWith("bunny/"))
			return ProcessBunnyApiCall(account, request.mid(6), hRequest);

		if(request.startsWith("ztamps/"))
			return ZtampManager::Instance().ProcessApiCall(account, request.mid(7), hRequest);

		if(request.startsWith("ztamp/"))
			return ProcessZtampApiCall(account, request.mid(6), hRequest);

		if(request.startsWith("accounts/"))
			return AccountManager::Instance().ProcessApiCall(account, request.mid(9), hRequest);

        return ApiManager::ApiError(QString("Unknown Api Call : %1").arg(hRequest.toString()));
	}
}

ApiManager::ApiAnswer * ApiManager::ProcessGlobalApiCall(Account const& account, QString const& request, HTTPRequest const& hRequest)
{
    if(request == "about")
	{
        if (isJsonApiCall)
        {
            QVariantMap map;
            map.insert("ServerName", "OpenJabNab");
            map.insert("Version", "v0.02");
            map.insert("Build", "Build " __DATE__ " / " __TIME__ );
            return ApiManager::ApiVariantMap(map);
        }
        else
            return ApiManager::ApiString("OpenJabNab v0.02 - (Build " __DATE__ " / " __TIME__ ")");
	}
    else if(request == "ping")
	{
        if (isJsonApiCall)
        {
            QVariantMap map;
            map.insert("ConnectedBunnies", BunnyManager::Instance().GetConnectedBunnyCount());
            map.insert("MaxNumberOfBunnies", GlobalSettings::GetInt("Config/MaxNumberOfBunnies", 64));
            map.insert("MaxBurstNumberOfBunnies", GlobalSettings::GetInt("Config/MaxBurstNumberOfBunnies", GlobalSettings::GetInt("Config/MaxNumberOfBunnies", 64)));
            return ApiManager::ApiVariantMap(map);
        }
        else
            return ApiManager::ApiString(
                QString::number(BunnyManager::Instance().GetConnectedBunnyCount()) + "/" +
                QString::number(GlobalSettings::GetInt("Config/MaxNumberOfBunnies", 64)) + "/" +
                QString::number(GlobalSettings::GetInt("Config/MaxBurstNumberOfBunnies", GlobalSettings::GetInt("Config/MaxNumberOfBunnies", 64)))
            );
	}
    else if (request == "stats")
	{
        int bunnies = BunnyManager::Instance().GetBunnyCount();
        int connectedBunnies = BunnyManager::Instance().GetConnectedBunnyCount();

        int ztamps = ZtampManager::Instance().GetZtampCount();

        int plugins = PluginManager::Instance().GetPluginCount();
        int enabledPlugins = PluginManager::Instance().GetEnabledPluginCount();
        if (isJsonApiCall)
        {
            QVariantMap map;
            map.insert("KnownBunnies", bunnies);
            map.insert("ConnectedBunnies", connectedBunnies);
            map.insert("KnownZtamps", ztamps);
            map.insert("InstalledPlugins", plugins);
            map.insert("EnabledPlugins", enabledPlugins);
            return ApiManager::ApiMappedList(map);
        }
        else
        {
            QString stats = "<bunnies>" + QString::number(bunnies) + "</bunnies>";
            stats += "<connected_bunnies>" + QString::number(connectedBunnies) + "</connected_bunnies>";
            stats += "<ztamps>" + QString::number(ztamps) + "</ztamps>";
            stats += "<plugins>" + QString::number(plugins) + "</plugins>";
            stats += "<enabled_plugins>" + QString::number(enabledPlugins) + "</enabled_plugins>";
            return ApiManager::ApiXml(stats);
        }
	}

    if(!account.IsAdmin() || !account.HasAccess(Account::AcGlobal,Account::Read))
        return ApiManager::ApiError("Access denied");

    if (request == "getListOfApiCalls")
	{
        if (isJsonApiCall)
        {
            QVariantMap fullMap;
            // Todo send a list with available api calls
            fullMap.insert("global/", GetApisAsJson());
            fullMap.insert("accounts/", AccountManager::Instance().GetApisAsJson());
            fullMap.insert("bunnies/", BunnyManager::Instance().GetApisAsJson());
            fullMap.insert("ztamps/", ZtampManager::Instance().GetApisAsJson());
            fullMap.insert("plugin/", PluginManager::Instance().GetPluginsApis());
            return ApiManager::ApiMappedList(fullMap);
        }
	}
    return ApiManager::ApiError(QString("Unknown Global Api Call : %1").arg(hRequest.toString()));
}

ApiManager::ApiAnswer * ApiManager::ProcessPluginApiCall(Account const& account, QString const& request, HTTPRequest & hRequest)
{
    QStringList list = QString(request).split('/', QString::SkipEmptyParts);

    if(list.size() != 2)
        return ApiManager::ApiError(QString("Malformed Plugin Api Call : %1").arg(hRequest.toString()));

    QString const& pluginName = list.at(0);
    QString const& functionName = list.at(1);

    PluginInterface * plugin = PluginManager::Instance().GetPluginByName(pluginName);
	if(!plugin)
        return ApiManager::ApiError(QString("Unknown Plugin : %1<br />Request was : %2").arg(pluginName,hRequest.toString()));

    if(!plugin->GetEnable())
        return ApiManager::ApiError("This plugin is disabled");

    return plugin->ProcessApiCall(account, functionName, hRequest);
}

ApiManager::ApiAnswer * ApiManager::ProcessBunnyApiCall(Account const& account, QString const& request, HTTPRequest const& hRequest)
{
    QStringList list = QString(request).split('/', QString::SkipEmptyParts);

    if(list.size() < 2)
        return ApiManager::ApiError(QString("Malformed Bunny Api Call : %1").arg(hRequest.toString()));

    QByteArray const& bunnyID = list.at(0).toAscii();

    if(!account.HasBunnyAccess(bunnyID))
        return ApiManager::ApiError("Access denied to this bunny");

    Bunny * b = BunnyManager::GetBunny(bunnyID);

    if(list.size() == 2)
	{
        QByteArray const& functionName = list.at(1).toAscii();
        return b->ProcessApiCall(account, functionName, hRequest);
	}
    // ici il est supposé que 3 parametres impliquent l'usage d'un plugin lapin
    else if(list.size() == 3)
	{
            PluginInterface * plugin = PluginManager::Instance().GetPluginByName(list.at(1).toAscii());
            if(!plugin)
                return ApiManager::ApiError(QString("Unknown Plugin : '%1'").arg(list.at(1)));

            if(b->HasPlugin(plugin) || ( (plugin->GetType() == PluginInterface::SystemPlugin || plugin->GetType() == PluginInterface::RequiredPlugin ) && plugin->GetEnable()))
			{
                QByteArray const& functionName = list.at(2).toAscii();
                return plugin->ProcessBunnyApiCall(b, account, functionName, hRequest);
			}
		else
            return ApiManager::ApiError("This plugin is not enabled for this bunny");
	}
	else
        return ApiManager::ApiError(QString("Malformed Plugin Api Call : %1").arg(hRequest.toString()));
}

ApiManager::ApiAnswer * ApiManager::ProcessBunnyVioletApiCall(QString const& request, HTTPRequest const& hRequest)
{
    QStringList list = QString(request).split('/', QString::SkipEmptyParts);

    if(list.size() < 3)
        return ApiManager::ApiError(QString("Malformed Bunny Api Call : %1").arg(hRequest.toString()));

    QString serial = hRequest.GetArg("sn");

    Bunny * b = BunnyManager::GetBunny(serial.toAscii());

    if(list.size() == 3)
	{
        return b->ProcessVioletApiCall(hRequest);
	}
	else
        return ApiManager::ApiError(QString("Malformed Plugin Api Call : %1").arg(hRequest.toString()));
}

ApiManager::ApiAnswer * ApiManager::ProcessZtampApiCall(Account const& account, QString const& request, HTTPRequest const& hRequest)
{
	QStringList list = QString(request).split('/', QString::SkipEmptyParts);

	if(list.size() < 2)
        return ApiManager::ApiError(QString("Malformed Ztamp Api Call : %1").arg(hRequest.toString()));

	QByteArray const& ztampID = list.at(0).toAscii();

	if(!account.HasZtampAccess(ztampID))
        return ApiManager::ApiError("Access denied to this ztamp");

	Ztamp * z = ZtampManager::GetZtamp(ztampID);

	if(list.size() == 2)
	{
		QByteArray const& functionName = list.at(1).toAscii();
		return z->ProcessApiCall(account, functionName, hRequest);
	}
	else if(list.size() == 3)
	{
			PluginInterface * plugin = PluginManager::Instance().GetPluginByName(list.at(1).toAscii());
			if(!plugin)
                return ApiManager::ApiError(QString("Unknown Plugin : '%1'").arg(list.at(1)));

			if(z->HasPlugin(plugin))
			{
				QByteArray const& functionName = list.at(2).toAscii();
				return plugin->ProcessZtampApiCall(z, account, functionName, hRequest);
			}
		else
            return ApiManager::ApiError("This plugin is not enabled for this ztamp");
	}
	else
        return ApiManager::ApiError(QString("Malformed Plugin Api Call : %1").arg(hRequest.toString()));
}

QVariantList ApiManager::GetApisAsJson() const
{
    QVariantList globalList;
    QVariantMap globalApiMap;

    QVariantList emptyList;
    QVariantList tokenParamList;
    tokenParamList.append("token");

    QVariantMap apilistFunc, apiAboutFunc, apiPingFunc, apiStatFunc;
    apilistFunc.insert("functionName", "getListOfApiCalls");
    apilistFunc.insert("parameters", tokenParamList);
    apiAboutFunc.insert("functionName", "about");
    apiAboutFunc.insert("parameters", emptyList);
    apiPingFunc.insert("functionName", "ping");
    apiPingFunc.insert("parameters", emptyList);
    apiStatFunc.insert("functionName", "stats");
    apiStatFunc.insert("parameters", emptyList);
    globalList.append(apilistFunc);
    globalList.append(apiAboutFunc);
    globalList.append(apiPingFunc);
    globalList.append(apiStatFunc);

    globalApiMap.insert("Api", globalList);
    QVariantMap funcCat;
    funcCat.insert("FunctionCategories", globalApiMap);
    QVariantList globalFamilyList;
    globalFamilyList.append(funcCat);
    return globalFamilyList;
}

QString ApiManager::ApiAnswer::SanitizeXML(QString const& msg)
{
	if(msg.contains('<') || msg.contains('>') || msg.contains('&'))
		return "<![CDATA[" + msg + "]]>";
	return msg;
}

ApiManager::ApiAnswer* ApiManager::ApiError(QString s)
{
    if (isJsonApiCall)
        return new ApiJsonVariantMap(ApiJsonVariantMap::error, s);
    else
        return new ApiErrorObj(s);
}

ApiManager::ApiAnswer* ApiManager::ApiOk(QString s)
{
    if (isJsonApiCall)
        return new ApiJsonVariantMap(ApiJsonVariantMap::ok, s);
    else
        return new ApiOkObj(s);
}

ApiManager::ApiAnswer* ApiManager::ApiXml(QString s)
{
    return new ApiManager::ApiXmlObj(s);
}

ApiManager::ApiAnswer* ApiManager::ApiString(QString s)
{
    if (isJsonApiCall)
        return new ApiJsonVariantMap(s);
    else
        return new ApiStringObj(s);
}

ApiManager::ApiAnswer* ApiManager::ApiList(QList<QString> l)
{
    if (isJsonApiCall)
        return new ApiJsonVariantMap(l);
    else
        return new ApiListObj(l);
}

ApiManager::ApiAnswer* ApiManager::ApiMappedList(QMap<QString, QVariant> l)
{
    if (isJsonApiCall)
        return new ApiJsonVariantMap(l);
    else
        return new ApiMappedListObj(l);
}

ApiManager::ApiAnswer* ApiManager::ApiVariantMap(QVariantMap m)
{
    if (isJsonApiCall)
        return new ApiJsonVariantMap(m);

    return NULL;
}

QString ApiManager::ApiErrorObj::GetInternalData()
{
	return QString("<error>%1</error>").arg(SanitizeXML(error));
}

QString ApiManager::ApiOkObj::GetInternalData()
{
	return QString("<ok>%1</ok>").arg(SanitizeXML(string));
}

QString ApiManager::ApiStringObj::GetInternalData()
{
	return QString("<value>%1</value>").arg(SanitizeXML(string));
}

QString ApiManager::ApiListObj::GetInternalData()
{
	QString tmp;
	tmp += "<list>";
	foreach (QString b, list)
		tmp += QString("<item>%1</item>").arg(SanitizeXML(b));
	tmp += "</list>";
	return tmp;
}

QString ApiManager::ApiMappedListObj::GetInternalData()
{
	QString tmp;
	tmp += "<list>";
	QMapIterator<QString, QVariant> i(list);
	while (i.hasNext()) {
		i.next();
		tmp += QString("<item><key>%1</key><value>%2</value></item>").arg(SanitizeXML(i.key()), SanitizeXML(i.value().toString()));
	}
	tmp += "</list>";
	return tmp;
}

ApiManager::ApiJsonVariantMap::ApiJsonVariantMap(QString s)
{
    map.insert("value", s);
}

ApiManager::ApiJsonVariantMap::ApiJsonVariantMap(StatusMessage st, QString msg)
{
    if (st == error)
    {
        map.insert("status", "error");
        map.insert("message", msg);
    }
    else if (st == ok)
    {
        map.insert("status", "ok");
        map.insert("message", msg);
    }
    else
    {
        map.insert("status", "unknown");
    }
}

ApiManager::ApiJsonVariantMap::ApiJsonVariantMap(QList<QString> l)
{
    QVariantList list;
    foreach (QString key, l)
    {
        list.append(key);
    }
    map.insert("list", list);
}

QByteArray ApiManager::ApiJsonVariantMap::GetData()
{
    QString tmp;
    QJson::Serializer serializer;
    bool ok;
    QByteArray json = serializer.serialize(map, &ok);
    if (ok == true)
        return json;
    else
        return QString("{\"error\":\"failed to serialize\"}").toUtf8();
}

QString ApiManager::ApiJsonVariantMap::GetInternalData()
{
    QString tmp;
    QJson::Serializer serializer;
    bool ok;
    QByteArray json = serializer.serialize(map, &ok);
    tmp = QString(json.constData());
    return tmp;
}

void ApiManager::ApiViolet::AddMessage(QString m, QString c)
{
	string += "<message>" + m + "</message>";
	string += "<comment>" + c + "</comment>";
}

void ApiManager::ApiViolet::AddEarPosition(int l, int r)
{
	string += "<message>POSITIONEAR</message>";
	string += "<leftposition>" + QString::number(l) + "</leftposition>";
	string += "<rightposition>" + QString::number(r) + "</rightposition>";
}

QByteArray ApiManager::ApiViolet::GetData()
{
	QString tmp("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
	tmp.append("<rsp>");
	tmp.append(GetInternalData());
	tmp.append("</rsp>");
	return tmp.toUtf8();
}
