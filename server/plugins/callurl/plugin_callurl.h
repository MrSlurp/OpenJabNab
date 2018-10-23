#ifndef _PLUGINCALLURL_H_
#define _PLUGINCALLURL_H_

#include <QUrl>
#include <QMultiMap>
#include <QTextStream>
#include "plugininterface.h"
	
class PluginCallURL : public PluginInterface
{
	Q_OBJECT
	Q_INTERFACES(PluginInterface)

public:
	PluginCallURL();
	virtual ~PluginCallURL();

    virtual bool OnClick(Bunny *, PluginInterface::ClickType);
    virtual bool OnRFID(Bunny * b, QByteArray const& tag);
    virtual void OnCron(Bunny *, QVariant);
    virtual void OnBunnyConnect(Bunny *);
    virtual void OnBunnyDisconnect(Bunny *);
    void CallURL(Bunny *, QString);


	// API
	void InitApiCalls();
	PLUGIN_BUNNY_API_CALL(Api_setDefaultUrl);
	PLUGIN_BUNNY_API_CALL(Api_getDefaultUrl);
	PLUGIN_BUNNY_API_CALL(Api_AddWebcast);
	PLUGIN_BUNNY_API_CALL(Api_RemoveWebcast);
	PLUGIN_BUNNY_API_CALL(Api_ListWebcast);
	PLUGIN_BUNNY_API_CALL(Api_AddRFID);
	PLUGIN_BUNNY_API_CALL(Api_RemoveRFID);
	PLUGIN_BUNNY_API_CALL(Api_addUrl);
	PLUGIN_BUNNY_API_CALL(Api_removeUrl);
	PLUGIN_BUNNY_API_CALL(Api_getUrlsList);
};

#endif
