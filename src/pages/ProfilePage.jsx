import { useAuth } from "../hooks/useAuth";
import { useMemories } from "../hooks/useMemories";

export default function ProfilePage() {
  const { user } = useAuth();
  const { memories, loading } = useMemories();

  // Filter user's own memories
  const userMemories = memories.filter((m) => m.user_id === user?.id);

  return (
    <div className="profile-page">
      <div className="profile-header">
        {user?.profile_pic_url ? (
          <img
            src={user.profile_pic_url}
            alt={user.name}
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {user?.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h2>{user?.name}</h2>
        <p className="profile-type">
          {user?.auth_type === "google" ? "Google Account" : "Anonymous User"}
        </p>
      </div>

      <div className="profile-memories">
        <h3>Your Memories ({userMemories.length})</h3>

        {loading ? (
          <p>Loading...</p>
        ) : userMemories.length === 0 ? (
          <p>You haven&apos;t shared any memories yet.</p>
        ) : (
          <div className="memories-grid">
            {userMemories.map((memory) => (
              <div key={memory.id} className="memory-card">
                <h4>{memory.title || "Untitled"}</h4>
                <p>{memory.location_name}</p>
                {memory.year && <p>{memory.year}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
