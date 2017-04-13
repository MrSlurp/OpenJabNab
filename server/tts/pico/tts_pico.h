#ifndef _TTSGOOGLE_H_
#define _TTSGOOGLE_H_

#include <QHttp>
#include <QMultiMap>
#include <QTextStream>
#include <QThread>
#include "ttsinterface.h"
	
class TTSPico : public TTSInterface
{
	Q_OBJECT
	Q_INTERFACES(TTSInterface)
	
public:
	TTSPico();
	virtual ~TTSPico();
	QByteArray CreateNewSound(QString, QString, bool);

private:
};

#endif
