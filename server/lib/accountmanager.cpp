#include <QCoreApplication>
#include <QCryptographicHash>
#include <QDateTime>
#include <QDir>
#include <QFile>
#include <QLibrary>
#include <QString>
#include <QUuid>
#include "account.h"
#include "accountmanager.h"
#include "apimanager.h"
#include "bunny.h"
#include "bunnymanager.h"
#include "ztamp.h"
#include "bunnymanager.h"
#include "log.h"
#include "httprequest.h"
#include "settings.h"

AccountManager::AccountManager()
{
	accountsDir = QCoreApplication::applicationDirPath();
	if (!accountsDir.cd("accounts"))
	{
		if (!accountsDir.mkdir("accounts"))
		{
			LogError("Unable to create accounts directory !\n");
			exit(-1);
		}
		accountsDir.cd("accounts");
	}
}

AccountManager & AccountManager::Instance()
{
  static AccountManager p;
  return p;
}

AccountManager::~AccountManager()
{
	foreach(Account * a, listOfAccounts)
		delete a;
}

void AccountManager::LoadAccounts()
{
	LogInfo(QString("Finding accounts in : %1").arg(accountsDir.path()));
	/* Apply filters on accounts files */
    QStringList filtersJson;
    filtersJson << "*.json";
    accountsDir.setNameFilters(filtersJson);
    foreach (QFileInfo ffile, accountsDir.entryInfoList(QDir::Files))
    {
        /* Open File */
        QByteArray configFileName = accountsDir.absoluteFilePath(ffile.fileName().toAscii()).toAscii();
        Account * a = new Account();
        if (!a->LoadAccount(configFileName))
        {
            LogWarning(QString("Problem when loading config file for account: %1").arg(QString(configFileName)));
            delete a;
            continue;
        }
        listOfAccounts.append(a);
        listOfAccountsByName.insert(a->GetLogin(), a);
    }

	QStringList filters;
    filters << "*.dat";
    accountsDir.setNameFilters(filters);
	foreach (QFileInfo ffile, accountsDir.entryInfoList(QDir::Files))
	{
		/* Open File */
        if (listOfAccountsByName.contains(ffile.baseName()))
            continue;

		QByteArray configFileName = accountsDir.absoluteFilePath(ffile.fileName().toAscii()).toAscii();
        Account * a = new Account();
        if (!a->LoadAccount(configFileName))
        {
            LogWarning(QString("Problem when loading config file for account: %1").arg(QString(configFileName)));
            delete a;
            continue;
        }
        if (!listOfAccountsByName.contains(a->GetLogin()))
        {
            listOfAccounts.append(a);
            listOfAccountsByName.insert(a->GetLogin(), a);
        }
	}

	if(listOfAccounts.count() == 0)
	{
		LogWarning("No account loaded ... inserting default admin");
		Account * a = new Account(Account::DefaultAdmin);
		listOfAccounts.append(new Account(Account::DefaultAdmin));
		listOfAccountsByName.insert(a->GetLogin(), a);
	}
	LogInfo(QString("Total of accounts: %1").arg(listOfAccounts.count()));
}

void AccountManager::SaveAccounts()
{
	/* For each loaded account */
	foreach(Account * a, listOfAccounts) {
        /* Skip default admin */
        if(a->GetLogin() != "admin") {
            /* Select file */
            //QString fileName = accountsDir.absoluteFilePath(QString("%1.dat").arg(a->GetLogin()));
            QString jsonFileName = accountsDir.absoluteFilePath(QString("%1.json").arg(a->GetLogin()));
            //a->SaveAccount(fileName);
            a->SaveAccount(jsonFileName);
		}
	}
}

Account const& AccountManager::Guest()
{
	static Account guest(Account::Guest);
	return guest;
}

Account const& AccountManager::GetAccount(QByteArray const& token)
{
	QHash<QByteArray, TokenData>::iterator it = listOfTokens.find(token);
	if(it != listOfTokens.end())
	{
		unsigned int now = QDateTime::currentDateTime().toTime_t();
		if(now < it->expire_time)
		{
			it->expire_time = now + GlobalSettings::GetInt("Config/SessionTimeout", 300); // default : 5min
			return *(it->account);
		}
		else
		{
			listOfTokens.erase(it);
			return Guest();
		}
	}
	return Guest();
}

Account * AccountManager::GetAccountByLogin(QByteArray const& login)
{
	if(Instance().listOfAccountsByName.contains(login))
		return Instance().listOfAccountsByName.value(login);
	return NULL;
}

QByteArray AccountManager::GetToken(QString const& login, QByteArray const& hash)
{
	QHash<QString, Account *>::const_iterator it = listOfAccountsByName.find(login);
	if(it != listOfAccountsByName.end())
	{
		if((*it)->GetPasswordHash() == hash)
		{
			// Generate random token
			QByteArray token = QCryptographicHash::hash(QUuid::createUuid().toString().toAscii(), QCryptographicHash::Md5).toHex();
			TokenData t;
			t.account = *it;
			t.expire_time = QDateTime::currentDateTime().toTime_t() + GlobalSettings::GetInt("Config/SessionTimeout", 300);
			(*it)->SetToken(token);
			listOfTokens.insert(token, t);
			return token;
		}
		LogError(QString("Bad login : user=%1, hash=%2, proposed hash=%3").arg(login,QString((*it)->GetPasswordHash().toHex()),QString(hash.toHex())));
		return QByteArray();
	}
	LogError(QString("Bad login : user=%1").arg(QString(login)));
	return QByteArray();
}

/*******
 * API *
 *******/

void AccountManager::InitApiCalls()
{
	DECLARE_API_CALL("auth(login,pass)", &AccountManager::Api_Auth);
    DECLARE_API_CALL("checkAuth()", &AccountManager::Api_CheckAuth);
    DECLARE_API_CALL("logout()", &AccountManager::Api_Logout);
    DECLARE_API_CALL("changePassword(login,pass)", &AccountManager::Api_ChangePasswd);
	DECLARE_API_CALL("registerNewAccount(login,username,pass)", &AccountManager::Api_RegisterNewAccount);
	DECLARE_API_CALL("removeAccount(login)", &AccountManager::Api_RemoveAccount);
	DECLARE_API_CALL("addBunny(login,bunnyid)", &AccountManager::Api_AddBunny);
	DECLARE_API_CALL("removeBunny(login,bunnyid)", &AccountManager::Api_RemoveBunny);
	DECLARE_API_CALL("removeZtamp(login,zid)", &AccountManager::Api_RemoveZtamp);
	DECLARE_API_CALL("settoken(tk)", &AccountManager::Api_SetToken);
    DECLARE_API_CALL("setadmin(user,state?)", &AccountManager::Api_SetAdmin);
	DECLARE_API_CALL("setlanguage(login,lng)", &AccountManager::Api_SetLanguage);
	DECLARE_API_CALL("getlanguage(login)", &AccountManager::Api_GetLanguage);
	DECLARE_API_CALL("infos(user)", &AccountManager::Api_GetUserInfos);
	DECLARE_API_CALL("GetUserlist()", &AccountManager::Api_GetUserlist);
	DECLARE_API_CALL("GetConnectedUsers()", &AccountManager::Api_GetConnectedUsers);
	DECLARE_API_CALL("GetListOfAdmins()", &AccountManager::Api_GetListOfAdmins);
    DECLARE_API_CALL("GetAllUsersInfos()", &AccountManager::Api_GetAllUsersInfos);
}

API_CALL(AccountManager::Api_Auth)
{
	Q_UNUSED(account);

	QByteArray retour = GetToken(hRequest.GetArg("login"), QCryptographicHash::hash(hRequest.GetArg("pass").toAscii(), QCryptographicHash::Md5));
	if(retour == QByteArray())
        return ApiManager::ApiError("Access denied");

	LogInfo(QString("User login : %1").arg(hRequest.GetArg("login")));

    if (ApiManager::IsJsonApiCall())
    {
        Account authAccount = GetAccount(retour);
        QMap<QString, QVariant> list;
        list.insert("login",authAccount.GetLogin());
        list.insert("username",authAccount.GetUsername());
        list.insert("language",authAccount.GetLanguage());
        list.insert("isValid",listOfTokens.contains(authAccount.GetToken()));
        list.insert("token",QString(authAccount.GetToken()));
        list.insert("isAdmin",authAccount.IsAdmin());
        return ApiManager::ApiMappedList(list);
    }
    else
        return ApiManager::ApiString(retour);
}

API_CALL(AccountManager::Api_CheckAuth)
{
    Q_UNUSED(hRequest);
    //QString
    QHash<QByteArray, TokenData>::iterator it = listOfTokens.find(account.GetToken());
    if(it != listOfTokens.end())
    {
        return ApiManager::ApiOk("Succeed");
    }
    return ApiManager::ApiError("unknown token or session expired");
}

API_CALL(AccountManager::Api_Logout)
{
    Q_UNUSED(hRequest);
    //QString
    QHash<QByteArray, TokenData>::iterator it = listOfTokens.find(account.GetToken());
    if(it != listOfTokens.end())
    {
        listOfTokens.erase(it);
    }
    LogInfo(QString("User logout : %1").arg(account.GetLogin()));
    return ApiManager::ApiOk("Succeed");
}

API_CALL(AccountManager::Api_ChangePasswd)
{
	QString login = hRequest.GetArg("login");
	QString pwd = hRequest.GetArg("pass");
	LogWarning(QString("Login: %1 Pwd: %2 user %3").arg(login,pwd,account.GetLogin()));
	if(login == "" || pwd == "" || (!account.IsAdmin() && login != account.GetLogin()))
        return ApiManager::ApiError("Access denied");

	Account *ac = listOfAccountsByName.value(login.toAscii());
	if(ac == NULL)
        return ApiManager::ApiError("Login not found.");

	ac->SetPassword(QCryptographicHash::hash(pwd.toAscii(), QCryptographicHash::Md5));
	LogInfo(QString("Password changed for user '%1'").arg(login));
	SaveAccounts();
    return ApiManager::ApiOk("Password changed");
}

API_CALL(AccountManager::Api_RegisterNewAccount)
{
	if(GlobalSettings::Get("Config/AllowAnonymousRegistration", false) == false && !account.IsAdmin())
        return ApiManager::ApiError("Access denied");

	QString login = hRequest.GetArg("login");
	if(listOfAccountsByName.contains(login))
        return ApiManager::ApiError(QString("Account '%1' already exists").arg(hRequest.GetArg("login")));

	Account * a = new Account(login, hRequest.GetArg("username"), QCryptographicHash::hash(hRequest.GetArg("pass").toAscii(), QCryptographicHash::Md5));
	listOfAccounts.append(a);
	listOfAccountsByName.insert(a->GetLogin(), a);
	if(listOfAccounts.count() == 2 && listOfAccountsByName.contains("admin")) {
		LogWarning("Registering first account, set him admin.");
		a->setAdmin();
		//Todo: Drop default admin right now, security issues
	}
	SaveAccounts();
    return ApiManager::ApiOk(QString("New account created : %1").arg(hRequest.GetArg("login")));
}

API_CALL(AccountManager::Api_RemoveAccount)
{
	if(!account.IsAdmin())
        return ApiManager::ApiError("Access denied");

	QString login = hRequest.GetArg("login");
	if(!listOfAccountsByName.contains(login))
        return ApiManager::ApiError(QString("Account '%1' does not exist").arg(login));

	Account * a = GetAccountByLogin(login.toAscii());
	int indexOfAccount = listOfAccounts.indexOf(a);
	listOfAccounts.removeAt(indexOfAccount);
	listOfAccountsByName.remove(a->GetLogin());
	QFile accountFile(accountsDir.absoluteFilePath(QString("%1.dat").arg(a->GetLogin())));
	if(accountFile.remove())
        return ApiManager::ApiOk(QString("Account %1 removed").arg(login));
    return ApiManager::ApiError(QString("Error when removing account %1").arg(login));
}

API_CALL(AccountManager::Api_AddBunny)
{
	// Only admins can add a bunny to an account
	if(GlobalSettings::Get("Config/AllowUserManageBunny", false) == false && !account.IsAdmin())
        return ApiManager::ApiError("Access denied");

	QString login = hRequest.GetArg("login");
	if(!account.IsAdmin() && login != account.GetLogin())
        return ApiManager::ApiError("Access denied");

	if(!listOfAccountsByName.contains(login))
        return ApiManager::ApiError(QString("Account '%1' doesn't exist").arg(hRequest.GetArg("login")));
	QString bunnyid = hRequest.GetArg("bunnyid");

	// Lock bunny to this account
	Bunny *b = BunnyManager::GetBunny(bunnyid.toAscii());
	QString own = b->GetGlobalSetting("OwnerAccount","").toString();
	if(own != "" && own != login)
        return ApiManager::ApiError(QString("Bunny %1 is already attached to this account: '%2'").arg(bunnyid,own));

	b->SetGlobalSetting("OwnerAccount", login);
	QByteArray id = listOfAccountsByName.value(login)->AddBunny(bunnyid.toAscii());
	SaveAccounts();
    return ApiManager::ApiOk(QString("Bunny '%1' added to account '%2'").arg(QString(id)).arg(login));
}

API_CALL(AccountManager::Api_RemoveBunny)
{
	// Only admin can remove bunny to any accounts, else an auth user can remove a bunny from his account
	QString login = hRequest.GetArg("login");
	/* Account doesn't exist */
	if(!listOfAccountsByName.contains(login))
            return ApiManager::ApiError(QString("Account '%1' doesn't exist").arg(login));
	/* user is not admin and (is not allowed or it's not his account) */
	else if(!account.IsAdmin() && (GlobalSettings::Get("Config/AllowUserManageBunny", false) != true || account.GetLogin() != login))
            return ApiManager::ApiError(QString("Access denied to user '%1'").arg(login));

	QString bunnyID = hRequest.GetArg("bunnyid");
	if(listOfAccountsByName.value(login)->RemoveBunny(bunnyID.toAscii())) {
		Bunny *b = BunnyManager::GetBunny(bunnyID.toAscii());
		b->RemoveGlobalSetting("OwnerAccount");
		SaveAccounts();
        return ApiManager::ApiOk(QString("Bunny '%1' removed from account '%2'").arg(bunnyID).arg(login));
	} else
        return ApiManager::ApiError(QString("Can't remove bunny '%1' from account '%2'").arg(bunnyID).arg(login));
}

API_CALL(AccountManager::Api_RemoveZtamp)
{
	// Only admin can remove ztamp to any accounts, else an auth user can remove a ztamp from his account
	QString login = hRequest.GetArg("login");
	/* Account doesn't exist */
	if(!listOfAccountsByName.contains(login))
            return ApiManager::ApiError(QString("Account '%1' doesn't exist").arg(login));
	/* user is not admin and (is not allowed or it's not his account) */
	else if(!account.IsAdmin() && (GlobalSettings::Get("Config/AllowUserManageZtamp", false) != true || account.GetLogin() != login))
            return ApiManager::ApiError(QString("Access denied to user '%1'").arg(login));

	QString zID = hRequest.GetArg("zid");
	if(listOfAccountsByName.value(login)->RemoveZtamp(zID.toAscii())) {
		Ztamp *z = ZtampManager::GetZtamp(zID.toAscii());
		z->RemoveGlobalSetting("OwnerAccount");
		SaveAccounts();
        return ApiManager::ApiOk(QString("Ztamp '%1' removed from account '%2'").arg(zID).arg(login));
	} else
        return ApiManager::ApiError(QString("Can't remove ztamp '%1' from account '%2'").arg(zID).arg(login));
}

API_CALL(AccountManager::Api_SetToken)
{
	QHash<QString, Account *>::iterator it = listOfAccountsByName.find(account.GetLogin());
	if(it != listOfAccountsByName.end())
	{
		it.value()->SetToken(hRequest.GetArg("tk").toAscii());
		//SaveAccounts();
        return ApiManager::ApiString("Token changed");
	}

	//LogError("Account not found");
    return ApiManager::ApiError("Access denied");
}

API_CALL(AccountManager::Api_GetUserInfos)
{
	QString login = hRequest.GetArg("user");
	if(login == "" || (!account.IsAdmin() && login != account.GetLogin()))
        return ApiManager::ApiError("Access denied");

	Account *ac = listOfAccountsByName.value(login.toAscii());
	if(ac == NULL)
        return ApiManager::ApiError("Login not found.");

	QMap<QString, QVariant> list;
	list.insert("login",ac->GetLogin());
	list.insert("username",ac->GetUsername());
	list.insert("language",ac->GetLanguage());
	list.insert("isValid",listOfTokens.contains(ac->GetToken()));
	list.insert("token",QString(ac->GetToken()));
	list.insert("isAdmin",ac->IsAdmin());
    return ApiManager::ApiMappedList(list);
}

API_CALL(AccountManager::Api_GetUserlist)
{
	Q_UNUSED(hRequest);
	if(!account.IsAdmin())
        return ApiManager::ApiError("Access denied");

	QMap<QString, QVariant> list;
	foreach (Account* a, listOfAccounts)
		list.insert(a->GetLogin(),a->GetUsername());

    return ApiManager::ApiMappedList(list);
}

API_CALL(AccountManager::Api_GetConnectedUsers)
{
	Q_UNUSED(hRequest);
	if(!account.IsAdmin())
        return ApiManager::ApiError("Access denied");

	QList<QString> list;
	foreach (Account* a, listOfAccounts)
		if(listOfTokens.contains(a->GetToken()))
			list.append(a->GetLogin());
    return ApiManager::ApiList(list);
}

API_CALL(AccountManager::Api_GetListOfAdmins)
{
	Q_UNUSED(hRequest);
	if(!account.IsAdmin())
        return ApiManager::ApiError("Access denied");

	QList<QString> list;
	foreach (Account* a, listOfAccounts)
		if(a->IsAdmin())
			list.append(a->GetLogin());
    return ApiManager::ApiList(list);
}

API_CALL(AccountManager::Api_SetAdmin)
{
	QString login = hRequest.GetArg("user");
    QString state = hRequest.GetArg("state");

	if(login == "" || !account.IsAdmin())
        return ApiManager::ApiError("Access denied");

	/* Get User */
	Account *ac = listOfAccountsByName.value(login.toAscii());
	if(ac == NULL)
        return ApiManager::ApiError("Login not found.");
    ac->setAdmin(state == "false"? false:true);
    if (state == "false")
        return ApiManager::ApiOk(QString("user '%1' is not admin anymore").arg(login));
    else
        return ApiManager::ApiOk(QString("user '%1' is now admin").arg(login));
}

API_CALL(AccountManager::Api_SetLanguage)
{
	Q_UNUSED(account);

	QString login = hRequest.GetArg("login");
	QString language = hRequest.GetArg("lng");

	if(login == "")
        return ApiManager::ApiError("No account specified");

	/* Get User */
	Account *ac = listOfAccountsByName.value(login.toAscii());
	if(ac == NULL)
        return ApiManager::ApiError("Account not found.");
	ac->SetLanguage(language);
    return ApiManager::ApiOk(QString("Language is now '%1' for user '%2'").arg(language, login));
}

API_CALL(AccountManager::Api_GetLanguage)
{
	Q_UNUSED(account);

	QString login = hRequest.GetArg("login");

	if(login == "")
        return ApiManager::ApiError("No account specified");

	/* Get User */
	Account *ac = listOfAccountsByName.value(login.toAscii());
	if(ac == NULL)
        return ApiManager::ApiError("Account not found.");
    return ApiManager::ApiString(ac->GetLanguage());
}

API_CALL(AccountManager::Api_GetAllUsersInfos)
{
    Q_UNUSED(hRequest);
    if (!ApiManager::Instance().IsJsonApiCall())
        return ApiManager::ApiError("JSON only");

    if(!account.IsAdmin())
        return ApiManager::ApiError("Access denied");

    QVariantMap userList;
    QVariantList userInfoList;
    foreach(QString accountName, listOfAccountsByName.keys())
    {
        Account *ac = listOfAccountsByName.value(accountName);
        QMap<QString, QVariant> list;
        list.insert("login",ac->GetLogin());
        list.insert("username",ac->GetUsername());
        list.insert("language",ac->GetLanguage());
        list.insert("isValid",listOfTokens.contains(ac->GetToken()));
        list.insert("token",QString(ac->GetToken()));
        list.insert("isAdmin",ac->IsAdmin());
        userInfoList.append(list);
    }
    userList.insert("users", userInfoList);
    return ApiManager::ApiVariantMap(userList);
}
