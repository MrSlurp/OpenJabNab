#ifndef _PLUGINCLOCK_H_
#define _PLUGINCLOCK_H_

#include <QHttp>
#include <QMultiMap>
#include <QTextStream>
#include <QThread>
#include "plugininterface.h"
	
class PluginClock : public PluginInterface
{
	Q_OBJECT
	Q_INTERFACES(PluginInterface)
	
public:
	PluginClock();
	virtual ~PluginClock();
    virtual void OnCron(Bunny*, QVariant);
    virtual bool HasClickAction() { return true; }
    virtual bool OnClick(Bunny*, PluginInterface::ClickType);
    virtual void OnBunnyConnect(Bunny *);
    virtual void OnBunnyDisconnect(Bunny *);
	
    virtual void InitApiCalls();
	PLUGIN_BUNNY_API_CALL(Api_SetVoice);
	PLUGIN_BUNNY_API_CALL(Api_GetVoiceList);

private:
	QDir clockFolder;
	QMap<Bunny*, QString> bunnyList;
	QStringList availableVoices;
};

#endif
