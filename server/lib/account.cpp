#include <QCryptographicHash>
#include <QCoreApplication>
#include <QDataStream>
#include <QFlag>
#include <QFile>
#include "account.h"
#include "log.h"
#include "qjson/parser.h"
#include "qjson/qobjecthelper.h"
#include "qjson/serializer.h"

Account::Account()
{
	SetDefault();
}

Account::Account(SpecialAccount t)
{
	switch(t)
	{
		case Guest:
			SetDefault(); // Default values
			login = "guest";
			username = "Guest";
			break;

		case DefaultAdmin:
			login = "admin";
			username = "Administrator";
			passwordHash = QCryptographicHash::hash("admin", QCryptographicHash::Md5);
			isAdmin = true;
			break;
	}
}

Account::Account(QDataStream & in, unsigned int version)
{
	SetDefault();
	if(version == 1)
	{
		in >> login >> username >> passwordHash >> isAdmin >> UserAccess >> listOfBunnies >> listOfZtamps;
	}
	else
		LogError(QString("Can't load account with version %1").arg(version));
}

Account::Account(QString const& l, QString const& u, QByteArray const& p)
{
	SetDefault();
	login = l;
	username = u;
	passwordHash = p;
	language = "fr";
	UserAccess[AcGlobal] = Read;
	UserAccess[AcAccount] = ReadWrite;
	UserAccess[AcBunnies] = ReadWrite;
	UserAccess[AcZtamps] = ReadWrite;
	UserAccess[AcPlugins] = Read;
	UserAccess[AcPluginsBunny] = ReadWrite;
	UserAccess[AcPluginsZtamp] = ReadWrite;
}

Account::Account(QString const& l, QString const& u, QByteArray const& p, QString const& lng)
{
	SetDefault();
	login = l;
	username = u;
	passwordHash = p;
	language = lng;
	UserAccess[AcGlobal] = Read;
	UserAccess[AcAccount] = ReadWrite;
	UserAccess[AcBunnies] = ReadWrite;
	UserAccess[AcZtamps] = ReadWrite;
	UserAccess[AcPlugins] = Read;
	UserAccess[AcPluginsBunny] = ReadWrite;
	UserAccess[AcPluginsZtamp] = ReadWrite;
}

void Account::SetDefault()
{
	// By default NO ACCESS
	isAdmin = false;
    // an array would have been more appropriated
	UserAccess.insert(AcGlobal,None);
	UserAccess.insert(AcAccount,None);
	UserAccess.insert(AcBunnies,None);
	UserAccess.insert(AcZtamps,None);
	UserAccess.insert(AcPluginsBunny,None);
	UserAccess.insert(AcPluginsZtamp,None);
	UserAccess.insert(AcPlugins,None);
	UserAccess.insert(AcServer,None);
}

bool Account::LoadAccount(QString fileName)
{
    if (fileName.endsWith(".json") && QFile::exists(fileName))
    {
        LogInfo(QString("json account file found %1").arg(fileName));
        return LoadJsonConfig(fileName);
    }
    else if (fileName.endsWith(".dat") && QFile::exists(fileName))
    {
        LogInfo(QString("binary account file found %1").arg(fileName));
        return LoadBinaryConfig(fileName);
    }
    return false;
}

void Account::SaveAccount(QString fileName)
{
    if (fileName.endsWith(".json") )
        SaveJsonConfig(fileName);
    else if (fileName.endsWith(".dat"))
        SaveBinaryConfig(fileName);
}

bool Account::LoadJsonConfig(QString fileName)
{
    QFile file(fileName);
    if (!file.open(QIODevice::ReadOnly))
    {
        LogError(QString("Cannot open config file for reading : %1").arg(QString(fileName)));
        return false;
    }
    QJson::Parser parser;
    bool ok;
    QVariantMap result = parser.parse(&file, &ok).toMap();
    if (!ok)
    {
        LogError(QString("Problem when parsing json account file : %1").arg(fileName));
        return false;
    }

    if (   result["login"].isNull()
        || result["username"].isNull()
        || result["passwordHash"].isNull()
        || result["isAdmin"].isNull()
        || result["UserAccess"].isNull()
        || result["listOfBunnies"].isNull()
        || result["listOfZtamps"].isNull()
        )
    {
        LogError(QString("Problem when loading json config file for account : %1, missing field").arg(fileName));
        return false;
    }
    login = result["login"].toString();
    username = result["username"].toString();
    passwordHash = result["passwordHash"].toByteArray();
    isAdmin = result["isAdmin"].toBool();
    if (!result["language"].isNull())
        language = result["language"].toString();
    LogInfo(QString("Loading user %1 : is admin %2 ").arg(username, isAdmin ? "true": "false"));
    int index = 0;
    LogInfo(QString("User %1 : Reading Access").arg(username));
    foreach(QVariant v, result["UserAccess"].toList())
    {
        LogInfo(QString("User %1 : access : idx %2 = %3").arg(username).arg(index).arg(v.toInt()));
        UserAccess[index] = QFlag(v.toInt());
        index++;
    }
    listOfBunnies.clear();
    LogInfo(QString("User %1 : Reading bunnies").arg(username));
    foreach(QVariant v, result["listOfBunnies"].toList())
    {
        LogInfo(QString("User %1 : bunny added : %2").arg(username, v.toString()));
        listOfBunnies.append(v.toByteArray());
    }

    listOfZtamps.clear();
    LogInfo(QString("User %1 : Reading ZTamps").arg(username));
    foreach(QVariant v, result["listOfZtamps"].toList())
    {
        LogInfo(QString("User %1 : ztamp added : %2").arg(username, v.toString()));
        listOfZtamps.append(v.toByteArray());
    }

    return true;
}

void Account::SaveJsonConfig(QString fileName)
{
    Q_UNUSED(fileName);

    QFile jsonfile(fileName);
    if (!jsonfile.open(QIODevice::WriteOnly))
    {
        LogError(QString("Cannot open json config file for writing : %1").arg(fileName));
        return;
    }

    QVariantMap config;
    config.insert("login", login);
    config.insert("username", username);
    config.insert("passwordHash", passwordHash);
    config.insert("isAdmin", isAdmin);
    config.insert("language", language);

    QVariantList jsonUserAccess;
    int index = 0;
    foreach(Account::Rights r, UserAccess)
    {
        jsonUserAccess.append((int)r);
        index++;
    }
    config.insert("UserAccess", jsonUserAccess);

    QVariantList jsonBunnies;
    foreach(QByteArray a, listOfBunnies)
    {
        jsonBunnies.append(a);
    }
    config.insert("listOfBunnies", jsonBunnies);

    QVariantList jsonZtamps;
    foreach(QByteArray a, listOfZtamps)
    {
        jsonZtamps.append(a);
    }
    config.insert("listOfZtamps", jsonZtamps);

    QJson::Serializer serializer;
    bool ok;
    QByteArray json = serializer.serialize(config, &ok);
    QTextStream  outjson(&jsonfile);
    outjson << json;
}

bool Account::LoadBinaryConfig(QString fileName)
{
    QFile file(fileName);
    if (!file.open(QIODevice::ReadOnly))
    {
        LogError(QString("Cannot open config file for reading : %1").arg(QString(fileName)));
        return NULL;
    }
    QDataStream in(&file);
    in.setVersion(QDataStream::Qt_4_3);
    int version;
    in >> version;

    if(version == 1)
    {
        in >> login >> username >> passwordHash >> isAdmin >> UserAccess >> listOfBunnies >> listOfZtamps;
    }
    else
    {
        LogError(QString("Can't load account with version %1").arg(version));
        return false;
    }
    if (in.status() != QDataStream::Ok)
    {
        LogWarning(QString("Problem when loading config file for account: %1").arg(QString(fileName)));
        return false;
    }
    LogInfo(QString("Account file %1 loaded").arg(fileName));
    return true;
}

void Account::SaveBinaryConfig(QString fileName)
{
    Q_UNUSED(fileName);
}



QDataStream & operator<< (QDataStream & out, const Account & a)
{
	out << a.login << a.username << a.passwordHash << a.isAdmin << a.UserAccess << a.listOfBunnies << a.listOfZtamps;
	return out;
}

QDataStream & operator>> (QDataStream & in, Account::Rights & r)
{
	int value;
	in >> value;
	r = QFlag(value);
	return in;
}

QDataStream & operator<< (QDataStream & out, const Account::Rights & r)
{
	out << (int)r;
	return out;
}
