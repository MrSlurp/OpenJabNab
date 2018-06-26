#include "account.h"
#include "bunny.h"
#include "bunnymanager.h"
#include "httprequest.h"

BunnyManager::BunnyManager()
{
	bunniesDir = QCoreApplication::applicationDirPath();
	bunniesDir.cd("bunnies");
}

BunnyManager & BunnyManager::Instance()
{
  static BunnyManager b;
  return b;
}

void BunnyManager::LoadAllBunnies()
{
	LogInfo(QString("Finding bunnies in : %1").arg(bunniesDir.path()));
	QStringList filters;
	filters << "*.dat";
	bunniesDir.setNameFilters(filters);
	foreach (QFileInfo file, bunniesDir.entryInfoList(QDir::Files))
	{
		GetBunny(file.baseName().toAscii());
	}
}

QList<QByteArray> BunnyManager::GetConnectedBunniesList(void)
{
	QList<QByteArray> list;
	foreach(Bunny *b,Instance().listOfBunnies)
	{
		if(b->IsConnected()) {
			list.append(b->GetID());
		}
	}

	return list;
}

void BunnyManager::InitApiCalls()
{
    DECLARE_API_CALL("getUserBunniesStatus()", &BunnyManager::Api_GetUserBunniesStatus);
    DECLARE_API_CALL("getListOfConnectedBunnies()", &BunnyManager::Api_GetListOfConnectedBunnies);
	DECLARE_API_CALL("getListOfBunnies()", &BunnyManager::Api_GetListOfBunnies);
	DECLARE_API_CALL("removeBunny(serial)", &BunnyManager::Api_RemoveBunny);
	DECLARE_API_CALL("addBunny(serial)", &BunnyManager::Api_AddBunny);
	DECLARE_API_CALL("getListofAllBunnies()",&BunnyManager::Api_GetListOfAllBunnies);
	DECLARE_API_CALL("getListofAllConnectedBunnies()",&BunnyManager::Api_GetListOfAllConnectedBunnies);
	DECLARE_API_CALL("resetAllBunniesPassword()",&BunnyManager::Api_ResetAllBunniesPassword);
}

API_CALL(BunnyManager::Api_RemoveBunny)
{
	if(!account.IsAdmin())
		return ApiManager::ApiError("Access denied");

	QString serial = hRequest.GetArg("serial");
	QByteArray hexSerial = QByteArray::fromHex(serial.toAscii());
	if(!listOfBunnies.contains(hexSerial))
		return ApiManager::ApiError(QString("Bunny '%1' does not exist").arg(serial));

	listOfBunnies.remove(hexSerial);
	QFile bunnyFile(bunniesDir.absoluteFilePath(QString("%1.dat").arg(serial)));
	if(bunnyFile.remove())
		return ApiManager::ApiOk(QString("Bunny %1 removed").arg(serial));
	return ApiManager::ApiError(QString("Error when removing bunny %1").arg(serial));
}

int BunnyManager::GetConnectedBunnyCount()
{
	return GetConnectedBunnies().count();
}

int BunnyManager::GetBunnyCount()
{
	return listOfBunnies.count();
}

Bunny * BunnyManager::GetBunny(QByteArray const& bunnyHexID)
{
    if(bunnyHexID.length()==0)
    {
        LogWarning("bunny required with empty ID !\n");
    }

    QByteArray bunnyID = QByteArray::fromHex(bunnyHexID);

	if(listOfBunnies.contains(bunnyID))
		return listOfBunnies.value(bunnyID);

	Bunny * b = new Bunny(bunnyID);
	listOfBunnies.insert(bunnyID, b);
	return b;
}

Bunny * BunnyManager::GetBunny(PluginInterface * p, QByteArray const& bunnyHexID)
{
    if(bunnyHexID.length()==0)
    {
        LogWarning("bunny required with empty ID !\n");
    }

	Bunny * b = GetBunny(bunnyHexID);

	if(p->GetType() != PluginInterface::BunnyPlugin)
		return b;
	if(b->HasPlugin(p))
		return b;
	return NULL;
}

Bunny * BunnyManager::GetConnectedBunny(QByteArray const& bunnyHexID)
{
	QByteArray bunnyID = QByteArray::fromHex(bunnyHexID);

	if(listOfBunnies.contains(bunnyID))
	{
		Bunny * b = listOfBunnies.value(bunnyID);
		if(b->IsConnected())
			return b;
	}

	return NULL;
}

void BunnyManager::Close()
{
	foreach(Bunny * b, listOfBunnies)
		delete b;
	listOfBunnies.clear();
}

QVector<Bunny *> BunnyManager::GetConnectedBunnies()
{
	QVector<Bunny *> list;
	foreach(Bunny * b, listOfBunnies)
		if (b->IsConnected())
			list.append(b);
	return list;
}

void BunnyManager::PluginStateChanged(PluginInterface * p)
{
	foreach(Bunny * b, listOfBunnies)
		if (b->IsConnected())
			b->PluginStateChanged(p);
}

void BunnyManager::PluginLoaded(PluginInterface * p)
{
	foreach(Bunny * b, listOfBunnies)
		if (b->IsConnected())
			b->PluginLoaded(p);
}

void BunnyManager::PluginUnloaded(PluginInterface * p)
{
	foreach(Bunny * b, listOfBunnies)
		if (b->IsConnected())
			b->PluginUnloaded(p);
}

API_CALL(BunnyManager::Api_GetUserBunniesStatus)
{
    Q_UNUSED(hRequest);

    if (!ApiManager::IsJsonApiCall())
        return ApiManager::ApiError("command supported only with json api");

    if(!account.HasAccess(Account::AcBunnies,Account::Read))
        return ApiManager::ApiError("Access denied");

    QVariantList list;
    foreach (QByteArray bunnyHexId, account.GetBunniesList())
    {
        QByteArray bunnyID = QByteArray::fromHex(bunnyHexId);
        if (listOfBunnies.contains(bunnyID))
        {
            Bunny * b = listOfBunnies.value(bunnyID);
            QVariantMap bunnyData;
            bunnyData.insert("IsRegistered", true);
            bunnyData.insert("IsConnected", b->IsConnected());
            bunnyData.insert("Name", b->GetBunnyName());
            bunnyData.insert("MAC", b->GetID());
            bunnyData.insert("IsSleeping", b->IsSleeping());
            bunnyData.insert("IsIdle", b->IsIdle());
            if (account.IsAdmin())
            {
                bunnyData.insert("BunnyPassword",b->GetBunnyPassword());
            }
            list.append(bunnyData);
        }
        else
        {
            QVariantMap bunnyData;
            bunnyData.insert("IsRegistered", false);
            bunnyData.insert("IsConnected", false);
            bunnyData.insert("Name", "Unknown");
            bunnyData.insert("MAC", bunnyHexId);
            bunnyData.insert("IsSleeping", false);
            bunnyData.insert("IsIdle", true);
            list.append(bunnyData);
        }

    }
    QVariantMap data;
    data.insert("bunnies", list);

    return ApiManager::ApiVariantMap(data);
}

API_CALL(BunnyManager::Api_GetListOfConnectedBunnies)
{
	Q_UNUSED(hRequest);

	if(!account.HasAccess(Account::AcBunnies,Account::Read))
		return ApiManager::ApiError("Access denied");

	QMap<QString, QVariant> list;
	foreach(Bunny * b, listOfBunnies)
		if(b->IsConnected() && account.GetBunniesList().contains(b->GetID()))
					list.insert(b->GetID(), b->GetBunnyName());

	return ApiManager::ApiMappedList(list);
}

API_CALL(BunnyManager::Api_GetListOfBunnies) {
	Q_UNUSED(hRequest);

	if(!account.HasAccess(Account::AcBunnies,Account::Read))
		return ApiManager::ApiError("Access denied");

	QMap<QString, QVariant> list;
	foreach(Bunny * b, listOfBunnies)
		if(account.GetBunniesList().contains(b->GetID()))
			list.insert(b->GetID(), b->GetBunnyName());

	return ApiManager::ApiMappedList(list);
}

API_CALL(BunnyManager::Api_GetListOfAllBunnies) {
	Q_UNUSED(hRequest);

	if(!account.IsAdmin())
		return ApiManager::ApiError("Access denied");

	QMap<QString, QVariant> list;
	foreach(Bunny * b, listOfBunnies)
		list.insert(b->GetID(), b->GetBunnyName());

	return ApiManager::ApiMappedList(list);
}

API_CALL(BunnyManager::Api_GetListOfAllConnectedBunnies) {
	Q_UNUSED(hRequest);

	if(!account.IsAdmin())
		return ApiManager::ApiError("Access denied");

	QMap<QString, QVariant> list;
	foreach(Bunny * b, listOfBunnies)
		if(b->IsConnected())
			list.insert(b->GetID(), b->GetBunnyName());

	return ApiManager::ApiMappedList(list);
}

API_CALL(BunnyManager::Api_ResetAllBunniesPassword) {
	Q_UNUSED(hRequest);

	if(!account.IsAdmin())
		return ApiManager::ApiError("Access denied");

	QMap<QString, QVariant> list;
	foreach(Bunny * b, listOfBunnies)
		b->ClearBunnyPassword();

	return ApiManager::ApiMappedList(list);
}

API_CALL(BunnyManager::Api_AddBunny) {
	if(!account.HasAccess(Account::AcBunnies,Account::Write))
		return ApiManager::ApiError("Access denied");

    QByteArray bunnyID = hRequest.GetArg("serial").toAscii();
    if(listOfBunnies.contains(bunnyID))
		return ApiManager::ApiError("Bunny already exists");

	GetBunny(bunnyID);
	return ApiManager::ApiOk("Bunny successfully added");
}

QHash<QByteArray, Bunny *> BunnyManager::listOfBunnies;
