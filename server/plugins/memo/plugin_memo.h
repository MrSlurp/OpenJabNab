#ifndef _PLUGINMEMO_H_
#define _PLUGINMEMO_H_

#include <QMultiMap>
#include "plugininterface.h"
	
class PluginMemo : public PluginInterface
{
	Q_OBJECT
	Q_INTERFACES(PluginInterface)

public:
	PluginMemo();
	virtual ~PluginMemo();

    virtual void OnBunnyConnect(Bunny *);
    virtual void OnBunnyDisconnect(Bunny *);
    virtual void OnCron(Bunny *, QVariant);

	// API
    virtual void InitApiCalls();
	PLUGIN_BUNNY_API_CALL(Api_AddWebcast);
	PLUGIN_BUNNY_API_CALL(Api_RemoveWebcast);
	PLUGIN_BUNNY_API_CALL(Api_ListWebcast);
	PLUGIN_BUNNY_API_CALL(Api_AddDailyWebcast);
	PLUGIN_BUNNY_API_CALL(Api_RemoveDailyWebcast);
	PLUGIN_BUNNY_API_CALL(Api_ListDailyWebcast);

private:
	QDir memoFolder;
};

#endif
