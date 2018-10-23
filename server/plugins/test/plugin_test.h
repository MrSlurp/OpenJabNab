#ifndef _PLUGINTEST_H_
#define _PLUGINTEST_H_

#include "plugininterface.h"
	
class PluginTest : public PluginInterface
{
	Q_OBJECT
	Q_INTERFACES(PluginInterface)

public:
	PluginTest();
	virtual ~PluginTest();
    virtual bool OnClick(Bunny *, PluginInterface::ClickType);
    virtual bool HttpRequestHandle(HTTPRequest &);
    virtual void InitApiCalls();
	PLUGIN_BUNNY_API_CALL(Api_LaunchTests);

private:
	int angle;
};

#endif
