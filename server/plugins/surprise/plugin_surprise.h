#ifndef _PLUGINSURPRISE_H_
#define _PLUGINSURPRISE_H_

#include "plugininterface.h"
	
class PluginSurprise : public PluginInterface
{
	Q_OBJECT
	Q_INTERFACES(PluginInterface)

public:
	PluginSurprise();
	virtual ~PluginSurprise();

	void OnBunnyConnect(Bunny *);
	void OnBunnyDisconnect(Bunny *);
	virtual void OnCron(Bunny *, QVariant);
	
	void InitApiCalls();
    bool OnClick(Bunny *, PluginInterface::ClickType);
	
protected:
	void createCron(Bunny *);
	int GetRandomizedFrequency(unsigned int);

	PLUGIN_BUNNY_API_CALL(Api_GetFolderList);
	PLUGIN_BUNNY_API_CALL(Api_SetFolder);
	PLUGIN_BUNNY_API_CALL(Api_GetFolder);
	PLUGIN_BUNNY_API_CALL(Api_SetFrequency);
	PLUGIN_BUNNY_API_CALL(Api_GetFrequency);

	QStringList availableSurprises;
};

#endif
