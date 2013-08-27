include $(GNUSTEP_MAKEFILES)/common.make

TOOL_NAME = mqplan
mqplan_C_FILES = mqplan.c \
                ../modules/qplan/server/tcp.c \
		../modules/qplan/server/context.c \
		../modules/qplan/server/web.c \
		../modules/qplan/server/websockets/base64.c \
		../modules/qplan/server/websockets/handshake.c \
		../modules/qplan/server/websockets/frames.c \
		../modules/qplan/server/websockets/read_message.c \
		../modules/qplan/server/websockets/util.c
mqplan_LDFLAGS = -llua52 -lpthread -lreadline
mqplan_CFLAGS = -I/usr/local/include/lua52
mqplan_INCLUDE_DIRS = -I../modules/qplan/server
ADDITIONAL_TOOL_LIBS = -lssl -lcrypto -lm

include $(GNUSTEP_MAKEFILES)/tool.make
