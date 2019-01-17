using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Extensions;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public interface IDatingRepository
    {
         void Add<T>(T entity) where T: class;
         void Delete<T>(T entity) where T: class;

         Task<bool> SaveAll();
         Task<PagedList<Users>> GetUsers(UserParams userParams);

         Task<Users> GetUser(int id);

         Task<Photo> GetPhoto(int id);

         Task<Photo> GetMainPhotoForUser(int userId);
    }
}