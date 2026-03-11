import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMemories, useDeleteMemory } from "../hooks/useMemories";
import "./ProfilePage.css";

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { memories, loading } = useMemories();
	const { deleteMemory, loading: deleting } = useDeleteMemory();

	// Filter user's own memories
	const userMemories = memories.filter((m) => m.user_id === user?.id);

	const handleEdit = (memoryId) => {
		if (user?.auth_type !== "google") {
			alert("Only authenticated users can edit memories.");
			return;
		}
		navigate(`/share/${memoryId}`);
	};

	const handleDelete = async (memoryId, memoryTitle) => {
		if (user?.auth_type !== "google") {
			alert("Only authenticated users can delete memories.");
			return;
		}

		const confirmed = window.confirm(
			`Are you sure you want to delete "${memoryTitle || "Untitled"}"?\n\nThis action cannot be undone.`
		);

		if (!confirmed) return;

		try {
			await deleteMemory(memoryId);
			alert("Memory deleted successfully.");
			// Reload current route to refresh the list
			navigate(0);
		} catch (error) {
			alert("Failed to delete memory. Please try again.");
		}
	};

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
								<div className="memory-card-header">
									<h3>{memory.title || "Untitled"}</h3>
									{user?.auth_type === "google" && (
										<div className="memory-actions">
											<button
												className="btn-icon btn-edit"
												onClick={() => handleEdit(memory.id)}
												title="Edit memory"
												disabled={deleting}
											>
												✏️
											</button>
											<button
												className="btn-icon btn-delete"
												onClick={() => handleDelete(memory.id, memory.title)}
												title="Delete memory"
												disabled={deleting}
											>
												🗑️
											</button>
										</div>
									)}
								</div>
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
