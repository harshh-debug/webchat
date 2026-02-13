import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import { chatModel } from "../models/chatModel.js";
import { messageModel } from "../models/messageModel.js";
import axios from "axios";

export const createNewChat = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		const userId = req.user?._id;
		const { otherUserId } = req.body;
		if (!otherUserId) {
			return res.status(400).json({
				message: "Other user id is required",
			});
		}

		const existingChat = await chatModel.findOne({
			users: { $all: [userId, otherUserId], $size: 2 },
		});

		if (existingChat) {
			return res.json({
				message: "Chat already exits",
				chatId: existingChat._id,
			});
		}

		const newChat = await chatModel.create({
			users: [userId, otherUserId],
		});
		res.status(201).json({
			message: "New chat created",
			chatId: newChat._id,
		});
	} catch (error: any) {
		console.log("Error in create-new-chat", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};

export const getAllChat = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?._id;
		if (!userId) {
			return res.status(400).json({
				message: "UserId missing",
			});
		}
		const chats = await chatModel
			.find({ users: userId })
			.sort({ updatedAt: -1 });

		const chatWithUserData = await Promise.all(
			chats.map(async (chat) => {
				const otherUserId = chat.users.find((id) => id !== userId);

				const unseenCount = await messageModel.countDocuments({
					chatId: chat._id,
					sender: { $ne: userId },
					seen: false,
				});

				try {
					const { data } = await axios.get(
						`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
					);
					return {
						user: data,
						chat: {
							...chat.toObject(),
							latestMessage: chat.latestMessage || null,
							unseenCount,
						},
					};
				} catch (error) {
					console.log(error);
					return {
						user: { _id: otherUserId, name: "Unknown User" },
						chat: {
							...chat.toObject(),
							latestMessage: chat.latestMessage || null,
							unseenCount,
						},
					};
				}
			}),
		);
		return res.json({
			chats: chatWithUserData,
		});
	} catch (error: any) {
		console.log("Error in get-all-chat", error);
		return res.status(500).json({
			message: error.message,
		});
	}
};


export const sendMessage= async(req:AuthenticatedRequest,res:Response)=>{
	try {
		const senderId= req.user?._id
		const{chatId,text}=req.body
		const imageFile=req.file
		if(!senderId){
			return res.status(401).json({
				message:"Unauthorized"
			})
		}
		if(!chatId){
			return res.status(401).json({
				message:"ChatId required"
			})
		}
		if(!text && !imageFile){
			return res.status(400).json({
				message:"Either text or image is required"
			})

		}
		const chat = await chatModel.findById(chatId)
		if(!chat){
			return res.status(404).json({
				message:"Chat not found"
			})
		}

		const isUserInChat=chat.users.some(
			(userId)=>userId.toString()===senderId.toString()
		)
		if(!isUserInChat){
			return res.status(403).json({
				message:"You are not a participant of this chat"
			})
		}
		const otherUserId=chat.users.find(
			(userId)=>userId.toString()!==senderId.toString()
		)
		if(!otherUserId){
			return res.status(401).json({
				message:"No other user"
			})
		}

		//@todo: socket setup

		let messageData:any={
			chatId:chatId,
			senderId:senderId,
			seen:false,
			seenAt:undefined
		}
		if(imageFile){
			messageData.image={
				url:imageFile.path,
				publicId:imageFile.filename

			}
			messageData.messageType="image"
			messageData.text=text || ""
		}else{
			
		}
	} catch (error) {
		
	}

}
