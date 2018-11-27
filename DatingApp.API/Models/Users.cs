namespace DatingApp.API.Models
{
    public class Users
    {
        public int ID { get; set; }
        
        public string Username { get; set; }
        
        public byte[] PasswordHash {get; set;}

        public byte[] PasswordSalt {get; set;}

    }
}