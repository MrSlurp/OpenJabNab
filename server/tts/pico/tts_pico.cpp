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
    QString waveFileName = fileName.append("*.wav");
    QString mp3FileName = fileName.append("*.mp3");
    QString wavefilePath = outputFolder.absoluteFilePath(waveFileName);
    QString mp3filePath = outputFolder.absoluteFilePath(waveFileName);

    if(!forceOverwrite && QFile::exists(waveFileName))
        return ttsHTTPUrl.arg(voice, waveFileName).toAscii();

    // call local pico2wave
    QString cmd = "pico2wave -l " + voice + " -w ";
    cmd += wavefilePath;
    cmd += " \""+text.replace('\"', "\\\"")+"\"";
	system(cmd.toStdString().c_str());
    // make file mp3
    cmd = "lame "+wavefilePath+ " " + mp3filePath;
	system(cmd.toStdString().c_str());	
    return ttsHTTPUrl.arg(voice, mp3FileName).toAscii();
}

