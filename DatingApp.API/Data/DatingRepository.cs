using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public async Task<IEnumerable<Users>> GetUsers()
        {
            var users = await _db.Users.Include(p => p.Photos).ToListAsync();

            return users;
        }

        public async Task<bool> SaveAll()
        {
           // This is not working
           // _db.ChangeTracker.AutoDetectChangesEnabled = false;
            return await _db.SaveChangesAsync() > 0;
        }
    }
}