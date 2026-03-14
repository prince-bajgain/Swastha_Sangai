import { useState, useEffect } from "react";
import axios from "axios";

const CommentSection = ({ donationId }) => {

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/comments/${donationId}`
      );
      setComments(res.data);
    } catch (error) {
      console.log("Error loading comments", error);
    }
  };

  useEffect(() => {
    if (donationId) {
      fetchComments();
    }
  }, [donationId]);

 const postComment = async () => {

  if (!text.trim()) {
    alert("Comment shouldn't be empty");
    return;
  }

  try {

    if (editingId) {

      await axios.put(
        `http://localhost:5000/api/comments/${editingId}`,
        {
          comment: text
        }
      );

      setEditingId(null);

    } else {

      await axios.post(
        "http://localhost:5000/api/comments",
        {
          donationId: donationId,
          userName: "User",
          comment: text
        }
      );

    }

    setText("");
    fetchComments();

  } catch (error) {
    console.log(error);
    alert("Comment post failed");
  }

};

  const deleteComment = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/comments/${id}`
      );
      fetchComments();
    } catch (error) {
      console.log("Delete failed", error);
    }
  };

  const editComment = (c) => {
    setText(c.comment);
    setEditingId(c.id);
  };

  return (

    <div className="mt-4 bg-gray-800 p-4 rounded-lg">

      <h3 className="text-white mb-3 font-semibold">
        Comments
      </h3>

      {/* INPUT */}
      <div className="flex gap-2 mb-4">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write comment..."
          className="flex-1 p-2 rounded bg-gray-600 text-white outline-none"
        />

        <button
          onClick={postComment}
          className="bg-green-500 px-4 py-1 rounded text-white hover:bg-green-600"
        >
          {editingId ? "Update" : "Post"}
        </button>

      </div>

      {/* COMMENTS LIST */}
      {comments.length === 0 && (
        <p className="text-gray-400 text-sm">
          No comments yet
        </p>
      )}

      {comments.map((c) => (

        <div
          key={c.id}
          className="bg-gray-700 p-3 rounded mb-2 flex justify-between items-center"
        >

          <div>
            <p className="text-white font-medium">
              {c.user_name}
            </p>

            <p className="text-gray-300 text-sm">
              {c.comment}
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() => editComment(c)}
              className="text-green-400 hover:text-green-300"
            >
              Edit
            </button>

            <button
              onClick={() => deleteComment(c.id)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </button>

          </div>

        </div>

      ))}

    </div>
  );
};

export default CommentSection;