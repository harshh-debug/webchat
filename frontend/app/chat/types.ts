import type { User } from "@/context/AppContext";

export interface Message {
	_id: string;
	chatId: string;
	sender: string;
	text?: string;
	image?: { url: string; publicId: string };
	messageType: "text" | "image";
	seen: boolean;
	seenAt?: string;
	createdAt: string;
}

export interface CreateNewChatApiResponse {
	message: string;
	chatId?: string;
}

export interface GetSelectedUserMessagesApiResponse {
	messages: Message[];
	user: User;
}

export interface SendMessageApiResponse {
	message: Message;
	sender: string;
}
