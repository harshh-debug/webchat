import amql from "amqplib"

let channel:amql.Channel;


export const connectRabbitMQ=async()=>{
    try {
        const connection= await amql.connect({
            protocol:"amqp",
            hostname:process.env.RabbitMQ_HOSTNAME,
            port:5672,
            username:process.env.RabbitMQ_USERNAME,
            password:process.env.RabbitMQ_PASSWORD,
        })
        channel= await connection.createChannel()
        console.log("Connected to RabbitMQ")
    } catch (error) {
        console.log("Failed to connect to RabbitMQ: ",error)
        
    }
}

export const publishToQueue= async(queueName:string,message:any)=>{
    if(!channel){
        console.log("RabbitMQ channel not initialized")
        return
    }
    await channel.assertQueue(queueName,{durable:true})
    channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{
        persistent:true
    })

}