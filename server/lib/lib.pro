######################################################################
# Automatically generated by qmake (2.01a) ven. janv. 18 16:34:17 2008
######################################################################

TEMPLATE = lib
CONFIG += qt release
#CONFIG += c++11
QMAKE_CXXFLAGS += -std=c++11
CONFIG -= debug
QT += network
QT -= gui
TARGET = common
INCLUDEPATH += . ../main
INCLUDEPATH += ../thirdparties
DEPENDPATH += . ../main
MOC_DIR = ./tmp/moc
OBJECTS_DIR = ./tmp/obj
DESTDIR = ../bin/
LIBS += -L"../thirdparties/qjson/lib" -lqjson

win32 {
	DEFINES += WIN32 OJN_MAKEDLL
        #QMAKE_CXXFLAGS_WARN_ON += -WX
}
unix {
	QMAKE_CXXFLAGS += -Werror
}
# Input
HEADERS +=	httphandler.h \
			xmpphandler.h \
			httprequest.h \
			settings.h \
			log.h \
			pluginmanager.h \
			pluginapihandler.h \
			pluginauthinterface.h \
			plugininterface.h \
			plugininterface_inline.h \
			packet.h \
			ambientpacket.h \
			messagepacket.h \
			sleeppacket.h \
			choregraphy.h \
			bunnymanager.h \
			bunny.h \
			ztampmanager.h \
			ztamp.h \
			apimanager.h \
			cron.h \
			ttsmanager.h \
			ttsinterface.h \
			ttsinterface_inline.h \
			accountmanager.h \
			account.h \
			apihandler.h \
			netdump.h \
			iq.h

SOURCES +=	httphandler.cpp \
			xmpphandler.cpp \
			httprequest.cpp \
			settings.cpp \
			log.cpp \
			pluginmanager.cpp \
			packet.cpp \
			ambientpacket.cpp \
			messagepacket.cpp \
			sleeppacket.cpp \
			choregraphy.cpp \
			bunnymanager.cpp \
			bunny.cpp \
			ztampmanager.cpp \
			ztamp.cpp \
			apimanager.cpp \
			cron.cpp \
			ttsmanager.cpp \
			accountmanager.cpp \
			account.cpp \
			netdump.cpp \
			iq.cpp
