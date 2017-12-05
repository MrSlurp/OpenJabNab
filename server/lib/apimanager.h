#ifndef _APIMANAGER_H_
#define _APIMANAGER_H_

#include <functional>

#include <QByteArray>
#include <QList>
#include <QMap>
#include <QMapIterator>
#include <QString>
#include <QVariant>
#include "global.h"

class Account;
class AccountManager;
class HTTPRequest;
class PluginManager;
class OJN_EXPORT ApiManager
{
public:
	class OJN_EXPORT ApiAnswer
	{
		public:
			virtual ~ApiAnswer() {}
			virtual QByteArray GetData(); // UTF8
			virtual QString GetInternalData() = 0;

		protected:
			QString SanitizeXML(QString const&);
	};

	static ApiManager & Instance();
    ApiAnswer * ProcessApiCall(QString , HTTPRequest &);
    static bool IsJsonApiCall() {return isJsonApiCall;}
    static ApiAnswer* ApiError(QString);
    static ApiAnswer* ApiOk(QString);
    static ApiAnswer* ApiXml(QString);
    static ApiAnswer* ApiString(QString);
    static ApiAnswer* ApiList(QList<QString> l);
    static ApiAnswer* ApiMappedList(QMap<QString, QVariant> l);
    static ApiAnswer* ApiVariantMap(QVariantMap m);

	// Internal classes
    class OJN_EXPORT ApiErrorObj : public ApiAnswer
	{
		public:
            ApiErrorObj(QString s):error(s) {}
			QString GetInternalData();
		private:
			QString error;
	};

    class OJN_EXPORT ApiXmlObj : public ApiAnswer
	{
		public:
            ApiXmlObj():string(QString()) {}
            ApiXmlObj(QString s):string(s) {}
			QString GetInternalData() { return string; }
		private:
			QString string;
	};

    class OJN_EXPORT ApiOkObj : public ApiAnswer
	{
		public:
            ApiOkObj():string(QString()) {}
            ApiOkObj(QString s):string(s) {}
			QString GetInternalData();
		private:
			QString string;
	};

	class OJN_EXPORT ApiStringObj : public ApiAnswer
	{
		public:
            ApiStringObj(QString s):string(s) {}
			QString GetInternalData();
		private:
			QString string;
	};

    class OJN_EXPORT ApiListObj : public ApiAnswer
	{
		public:
            ApiListObj(QList<QString> l):list(l) {}
			QString GetInternalData();
		private:
			QList<QString> list;
	};

    class OJN_EXPORT ApiMappedListObj : public ApiAnswer
	{
		public:
            ApiMappedListObj(QMap<QString, QVariant> l):list(l) {}
			QString GetInternalData();
		private:
			QMap<QString, QVariant> list;
	};

    class OJN_EXPORT ApiJsonVariantMap : public ApiAnswer
    {
        public:
            typedef enum {
                error=0,
                ok=1,
            }StatusMessage;
            ApiJsonVariantMap(StatusMessage st, QString msg);
            ApiJsonVariantMap(QString s);
            ApiJsonVariantMap(QList<QString> s);
            //ApiJsonVariantMap(QMap<QString, QVariant>);
            ApiJsonVariantMap(QVariantMap m):map(m) {}
            QByteArray GetData(); // UTF8
            QString GetInternalData();
        private:
            QVariantMap map;
    };

	class OJN_EXPORT ApiViolet : public ApiAnswer
	{
		public:
			ApiViolet(QString m, QString c) { AddMessage(m, c); }
			ApiViolet():string(QString()) {}
			ApiViolet(QString s):string(s) {}
			QByteArray GetData();
			void AddMessage(QString, QString);
			void AddEarPosition(int, int);
			void AddXml(QString s) { string += s; }
			QString GetInternalData() { return string; }
		private:
			QString string;
	};

private:
	ApiManager();
	ApiAnswer * ProcessGlobalApiCall(Account const&, QString const&, HTTPRequest const&);
	ApiAnswer * ProcessPluginApiCall(Account const&, QString const&, HTTPRequest &);
	ApiAnswer * ProcessBunnyApiCall(Account const&, QString const&, HTTPRequest const&);
	ApiAnswer * ProcessZtampApiCall(Account const&, QString const&, HTTPRequest const&);
	ApiAnswer * ProcessBunnyVioletApiCall(QString const&, HTTPRequest const&);
    static bool isJsonApiCall;
};
#endif
