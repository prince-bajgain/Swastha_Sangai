import { useState, useEffect } from "react"

function CommentSection(){

const [comments,setComments] = useState([])
const [text,setText] = useState("")

const fetchComments = async()=>{
const res = await fetch("http://localhost:5000/api/comments")
const data = await res.json()
setComments(data)
}

useEffect(()=>{
fetchComments()

const interval = setInterval(fetchComments,3000)

return ()=>clearInterval(interval)

},[])

const postComment = async()=>{

await fetch("http://localhost:5000/api/comments",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
message:text,
userId:1
})
})

setText("")
fetchComments()

}

const deleteComment = async(id)=>{

await fetch(`http://localhost:5000/api/comments/${id}`,{
method:"DELETE"
})

fetchComments()

}

const likeComment = async(id)=>{

await fetch(`http://localhost:5000/api/comments/like/${id}`,{
method:"PUT"
})

fetchComments()

}

return(

<div className="comment-container">

<h2>User Feedback</h2>

<textarea
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Write your feedback..."
/>

<button onClick={postComment}>Post</button>

{comments.map(c=>(

<div key={c.id} className="comment-card">

<img
src={c.user?.profileImage || "/default-avatar.png"}
width="40"
/>

<div>

<b>{c.user?.fullName}</b>

<p>{c.message}</p>

<button onClick={()=>likeComment(c.id)}>
👍 {c.likes}
</button>

<button onClick={()=>deleteComment(c.id)}>
Delete
</button>

</div>

</div>

))}

</div>

)

}

export default CommentSection