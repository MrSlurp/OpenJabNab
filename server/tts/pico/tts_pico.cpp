#include <QDateTime>
#include <QUrl>
#include <QCryptographicHash>
#include <QMapIterator>
#include "tts_pico.h"
#include "log.h"

Q_EXPORT_PLUGIN2(tts_pico, TTSPico)

TTSPico::TTSPico():TTSInterface("google", "Google")
{
	voiceList.insert("fr", "fr");
}

TTSPico::~TTSPico()
{
}

QByteArray TTSPico::CreateNewSound(QString text, QString voice, bool forceOverwrite)
{
	//QEventLoop loop;

	if(!voiceList.contains(voice))
		voice = "fr-FR";

	// Check (and create if needed) output folder
	QDir outputFolder = ttsFolder;
	if(!outputFolder.exists(voice))
		outputFolder.mkdir(voice);
	
	if(!outputFolder.cd(voice))
	{
		LogError(QString("Cant create TTS Folder : %1").arg(ttsFolder.absoluteFilePath(voice)));
		return QByteArray();
	}
	
	// Compute fileName
	QString fileName = QCryptographicHash::hash(text.toAscii(), QCryptographicHash::Md5).toHex();//.append(".mp3");
	QString filePath = outputFolder.absoluteFilePath(fileName);

	if(!forceOverwrite && QFile::exists(filePath))
		return ttsHTTPUrl.arg(voice, fileName).toAscii();

	QString cmd = "pico2wave -w ";
	QString waveFileName = fileName.append("*.wav");
	cmd += waveFileName;
	cmd += " \""+text+"\"";
	system(cmd.toStdString().c_str());
	
	cmd = "aplay ";
	cmd+= waveFileName;
	// now command is pico2wave -w res.wav whatever the user entered
	system(cmd.toStdString().c_str());	

	return ttsHTTPUrl.arg(voice, waveFileName).toAscii();
}

