using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Extensions;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _db;
        public DatingRepository(DataContext db)
        {
            _db = db;

        }
        public void Add<T>(T entity) where T : class
        {
            _db.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _db.Remove(entity);
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await _db.Likes.FirstOrDefaultAsync(u => u.LikerId == userId && u.LikeeId == recipientId);
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
           //Called from the PhotoController which passess the userId
           //Looks in Photo Table of the Database for a User who's UserId matches userId
           //Then looks for the first photo who's IsMain property is set to true
           return await _db.Photos.Where(u => u.UserId == userId).FirstOrDefaultAsync(p => p.IsMain);
        }

        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await _db.Photos.FirstOrDefaultAsync(p => p.Id == id);

            return photo;
        }

        public async Task<Users> GetUser(int id)
        {
           var user = await _db.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.ID == id);

           return user;
        }

        public async Task<PagedList<Users>> GetUsers(UserParams userParams)
        {
            // Old code for getting user information and photos
                // var users = await _db.Users.Include(p => p.Photos).ToListAsync();
                // return users;

            var users = _db.Users.Include(p => p.Photos).OrderByDescending(u => u.LastActive).AsQueryable();

            users = users.Where(u => u.ID != userParams.UserId);
            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.ID));
            }

            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikees.Contains(u.ID));
            }

            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDob = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;
                    default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }
            }

            return await PagedList<Users>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        {
            var user = await _db.Users.Include(x => x.Likers).Include(x => x.Likees).FirstOrDefaultAsync(u => u.ID == id);

            if (likers)
            {
                return user.Likers.Where(u => u.LikeeId == id).Select(i => i.LikerId);
            }
            else
            {
                return user.Likees.Where(u => u.LikerId == id).Select(i => i.LikeeId);
            }
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _db.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = _db.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .AsQueryable();

            switch (messageParams.MessageContainer)
            {
                case "Inbox":
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId
                        && u.RecipientDeleted == false);
                    break;
                case "Outbox":
                    messages = messages.Where(u => u.SenderId == messageParams.UserId 
                        && u.SenderDeleted == false);
                    break;
                default:
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId 
                        && u.RecipientDeleted == false && u.IsRead == false);
                    break;
            }

            messages = messages.OrderByDescending(d => d.MessageSent);

            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
        }
        public async Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId)
        {
            var messages = await _db.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .AsQueryable()
                .Where(m => m.RecipientId == userId && m.RecipientDeleted == false
                     && m.SenderId == recipientId 
                    || m.RecipientId == recipientId && m.SenderId == userId
                    && m.SenderDeleted == false)
                    .OrderByDescending(d => d.MessageSent).ToListAsync();

                    return messages;
        }
        public async Task<bool> SaveAll()
        {
           // This is not working
           // _db.ChangeTracker.AutoDetectChangesEnabled = false;
            return await _db.SaveChangesAsync() > 0;
        }
    }
} 