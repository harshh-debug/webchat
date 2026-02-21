"use client"
import Loading from '@/components/Loading'
import { useAppData, User } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export interface Message{
  _id:string;
  chatId:string;
  sender:string;
  text?:string;
  image?:{
    url:string;
    publicId:string;
  };
  messageType:"text" | "image"
  seen:boolean;
  seenAt?:string;
  createdAt:string;
}

const page = () => {
  const {loading , isAuth,logoutUser,chats,user:loggedInUser,users,fetchChats,setChats}= useAppData()

  const [selectedUser, setSelectedUser] = useState<string|null>(null)
  const [message, Setmessage] = useState("")
  const [sideBarOpen, setSideBarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]|null>(null)
  const [user, setUser] = useState<User| null>(null) //user we are chatting with
  const [showAllUsers, setShowAllUsers] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const router=useRouter()
  useEffect(()=>{
    if(!isAuth && !loading){
      router.push("/login")
    }
  },[isAuth,router,loading])
  if(loading){
    return <Loading></Loading>
  }
  return (
    <div>
      Chat
    </div>
  )
}

export default page
