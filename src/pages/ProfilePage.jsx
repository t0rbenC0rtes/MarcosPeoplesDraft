import { useAuth } from "../hooks/useAuth";
import { useMemories } from "../hooks/useMemories";
import "./ProfilePage.css";

export default function ProfilePage() {
	const { user } = useAuth();
	const { memories, loading } = useMemories();

	// Filter user's own memories
	const userMemories = memories.filter((m) => m.user_id === user?.id);

	return (
		<div className="profile-page">
			<div className="profile-header">
				<h2>{user?.name}</h2>
				<p className="profile-type">
					{user?.auth_type === "google"
						? "Google Account"
						: "Anonymous User"}
				</p>
			</div>

			<div className="profile-memories">
				<h2>Your Memories ({userMemories.length})</h2>

				{loading ? (
					<p>Loading...</p>
				) : userMemories.length === 0 ? (
					<p>You haven&apos;t shared any memories yet.</p>
				) : (
					<div className="memories-grid">
						{userMemories.map((memory) => (
							<div key={memory.id} className="memory-card">
								<h3>{memory.title || "Untitled"}</h3>
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
