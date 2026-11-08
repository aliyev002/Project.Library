using Microsoft.AspNetCore.SignalR;

namespace ProjectLibrary.Server.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task RegisterConnection(string userId, string? role)
        {
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }

            if (role == "Admin")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
            }
        }

        public async Task JoinUserGroup(string userId)
        {
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
        }

        public async Task JoinAdminsGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        public async Task LeaveUserGroup(string userId)
        {
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
        }
    }
}
