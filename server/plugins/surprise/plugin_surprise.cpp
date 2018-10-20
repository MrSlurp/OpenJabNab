#include <QMapIterator>
#include "plugin_surprise.h"
#include "bunny.h"
#include "cron.h"
#include "messagepacket.h"

Q_EXPORT_PLUGIN2(plugin_surprise, PluginSurprise)

// +/- 20% - 30min => rand(24,36)
#define RANDOMIZEDRATIO 20

PluginSurprise::PluginSurprise():PluginInterface("surprise", "Send random mp3 at random intervals",BunnyPlugin) {}

PluginSurprise::~PluginSurprise() {}

void PluginSurprise::createCron(Bunny * b)
{
	// Check Frequency
	unsigned int frequency = b->GetPluginSetting(GetName(), "frequency", (uint)0).toUInt();
	if(!frequency)
	{
		// Stable. Warning Removed.
		LogDebug(QString("Bunny '%1' has invalid frequency '%2'").arg(b->GetID(), QString::number(frequency)));
		return;
	}

	// Register cron
	Cron::RegisterOneShot(this, GetRandomizedFrequency(frequency), b, QVariant(), NULL);
}

int PluginSurprise::GetRandomizedFrequency(unsigned int freq)
{
	// 250 => ~30min, 125 => ~1h, 50 => ~2h30
	unsigned int meanTimeInSec = (250/freq) * 30;
	
	int deviation = 0;

	if(RANDOMIZEDRATIO > 0 && RANDOMIZEDRATIO < 100)
	{
		unsigned int maxDeviation = (meanTimeInSec * 2 * RANDOMIZEDRATIO) / 100;
		if(maxDeviation > 0)
		{
			deviation = qrand() % (maxDeviation);
		}
		deviation -= (maxDeviation/2);
	}

	return meanTimeInSec + deviation;
}

void PluginSurprise::OnBunnyConnect(Bunny * b)
{
	createCron(b);
}

void PluginSurprise::OnBunnyDisconnect(Bunny * b)
{
	Cron::UnregisterAllForBunny(this, b);
}

void PluginSurprise::OnCron(Bunny * b, QVariant)
{
	if(b->IsIdle())
	{
		QByteArray file;
		// Fetch available files
		QDir * dir = GetLocalHTTPFolder();
		if(dir)
		{
			QString surprise = b->GetPluginSetting(GetName(), "folder", QString()).toString();

			if(!surprise.isNull() && dir->cd(surprise))
			{
				QStringList list = dir->entryList(QDir::Files|QDir::NoDotAndDotDot);
				if(list.count())
				{
					file = GetBroadcastHTTPPath(QString("%1/%3").arg(surprise, list.at(qrand()%list.count())));
					QByteArray message = "MU "+file+"\nPL 3\nMW\n";
					b->SendPacket(MessagePacket(message));
				}
			}
			else
				LogError("Invalid surprise config");

			delete dir;
		}
		else
			LogError("Invalid GetLocalHTTPFolder()");
	}
	// Restart Timer
	createCron(b);
}

/*******
 * API *
 *******/

bool PluginSurprise::OnClick(Bunny * b, PluginInterface::ClickType type)
{
    if (type == PluginInterface::SingleClick)
    {
    if(b->IsIdle())
    {
      QByteArray file;
      // Fetch available files
      QDir * dir = GetLocalHTTPFolder();
      if(dir)
      {
        QString surprise = b->GetPluginSetting(GetName(), "folder", QString()).toString();

        if(!surprise.isNull() && dir->cd(surprise))
        {
          QStringList list = dir->entryList(QDir::Files|QDir::NoDotAndDotDot);
          if(list.count())
          {
            file = GetBroadcastHTTPPath(QString("%1/%3").arg(surprise, list.at(qrand()%list.count())));
            QByteArray message = "MU "+file+"\nPL 3\nMW\n";
            b->SendPacket(MessagePacket(message));
          }
        }
        else
          LogError("Invalid surprise config");

        delete dir;
      }
      else
        LogError("Invalid GetLocalHTTPFolder()");
    }

    }
    return true;
}

void PluginSurprise::InitApiCalls()
{
	DECLARE_PLUGIN_BUNNY_API_CALL("setFolder(name)", PluginSurprise, Api_SetFolder);
	DECLARE_PLUGIN_BUNNY_API_CALL("getFolder()", PluginSurprise, Api_GetFolder);
	DECLARE_PLUGIN_BUNNY_API_CALL("getFolderList()", PluginSurprise, Api_GetFolderList);
	DECLARE_PLUGIN_BUNNY_API_CALL("setFrequency(value)", PluginSurprise, Api_SetFrequency);
	DECLARE_PLUGIN_BUNNY_API_CALL("getFrequency()", PluginSurprise, Api_GetFrequency);
    DECLARE_PLUGIN_API_CALL("getConfigValues()", PluginSurprise, Api_GetConfigValues);
}

PLUGIN_BUNNY_API_CALL(PluginSurprise::Api_SetFolder)
{
	Q_UNUSED(account);

	QString folder = hRequest.GetArg("name");
    // should better check existing folders instead of internally (maybe not) initialized list
	if(availableSurprises.contains(folder))
	{
		// Save new config
		bunny->SetPluginSetting(GetName(), "folder", folder);

		return ApiManager::ApiOk(QString("Folder changed to '%1'").arg(folder));
	}
	return ApiManager::ApiError(QString("Unknown '%1' folder").arg(folder));
}

PLUGIN_BUNNY_API_CALL(PluginSurprise::Api_GetFolder)
{
        Q_UNUSED(account);
	Q_UNUSED(hRequest);

        return ApiManager::ApiOk(bunny->GetPluginSetting(GetName(), "folder", QString()).toString());
}

PLUGIN_BUNNY_API_CALL(PluginSurprise::Api_SetFrequency)
{
	Q_UNUSED(account);

	bunny->SetPluginSetting(GetName(), "frequency", QVariant(hRequest.GetArg("value").toInt()));
	OnBunnyDisconnect(bunny);
	OnBunnyConnect(bunny);
	return ApiManager::ApiOk(QString("Plugin configuration updated."));
}

PLUGIN_BUNNY_API_CALL(PluginSurprise::Api_GetFrequency)
{
        Q_UNUSED(account);
	Q_UNUSED(hRequest);

        return ApiManager::ApiOk(QString::number(bunny->GetPluginSetting(GetName(), "frequency", (uint)0).toInt()));
}

PLUGIN_BUNNY_API_CALL(PluginSurprise::Api_GetFolderList)
{
	Q_UNUSED(account);
	Q_UNUSED(bunny);
	Q_UNUSED(hRequest);

	// Check available folders and cache them
	QDir * httpFolder = GetLocalHTTPFolder();
	if(httpFolder)
	{
		availableSurprises = httpFolder->entryList(QDir::Dirs|QDir::NoDotAndDotDot);
		delete httpFolder;
	}

	return ApiManager::ApiList(availableSurprises);
}

PLUGIN_API_CALL(PluginSurprise::Api_GetConfigValues)
{
    Q_UNUSED(account);
    Q_UNUSED(hRequest);

    // Check available folders and cache them
    QDir * httpFolder = GetLocalHTTPFolder();
    QVariantMap configMap;
    if(httpFolder)
    {
        availableSurprises = httpFolder->entryList(QDir::Dirs|QDir::NoDotAndDotDot);
        auto infoList = httpFolder->entryInfoList(QDir::Dirs|QDir::NoDotAndDotDot);

        QVariantList availableFolders;
        foreach(auto dir , infoList)
        {
            QVariantMap folderInfo;
            folderInfo.insert("Name", dir.fileName());
            folderInfo.insert("FileCount", QDir(dir.absoluteFilePath()).entryList(QStringList("*.mp3"), QDir::Files| QDir::NoSymLinks |QDir::NoDotAndDotDot).count());
            availableFolders.append(folderInfo);
        }
        configMap.insert("Folders", availableFolders);
        delete httpFolder;
    }
    else
        configMap.insert("Folders", QVariantList());

    QVariantList valueList = QVariantList({0,50,100,150,200});
    configMap.insert("Frequencies", valueList);

    return ApiManager::ApiVariantMap(configMap);
}
