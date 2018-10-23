#ifndef _PluginWizzflux_H_
#define _PluginWizzflux_H_

#include <QUrl>
#include <QNetworkAccessManager>
#include "plugininterface.h"

class PluginWizzflux : public PluginInterface
{
	Q_OBJECT
	Q_INTERFACES(PluginInterface)

public:
	PluginWizzflux();
	virtual ~PluginWizzflux();
	virtual bool Init();
    virtual void OnCron(Bunny *, QVariant);
	virtual bool OnRFID(Bunny *, QByteArray const&);
	virtual bool OnRFID(Ztamp *, Bunny *);

    virtual bool OnClick(Bunny *, PluginInterface::ClickType);

    virtual void OnBunnyConnect(Bunny *);
    virtual void OnBunnyDisconnect(Bunny *);

	// API
	void InitApiCalls();
	PLUGIN_BUNNY_API_CALL(Api_AddRFID);
	PLUGIN_BUNNY_API_CALL(Api_RemoveRFID);
	PLUGIN_BUNNY_API_CALL(Api_AddWebcast);
	PLUGIN_BUNNY_API_CALL(Api_RemoveWebcast);
	PLUGIN_BUNNY_API_CALL(Api_GetDefault);
	PLUGIN_BUNNY_API_CALL(Api_SetDefault);
	PLUGIN_BUNNY_API_CALL(Api_Play);
	PLUGIN_BUNNY_API_CALL(Api_ListWebcast);
	PLUGIN_BUNNY_API_CALL(Api_ListFlux);
	PLUGIN_API_CALL(Api_GetFlux);
	PLUGIN_API_CALL(Api_SetFlux);
private:
	bool streamFlux(Bunny *, QString const);
    QStringList Flist;
private slots:
	void analyse(QNetworkReply*);
};


#endif
