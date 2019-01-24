namespace DatingApp.API.Models
{
    public class Like
    {
        public int LikerId { get; set; }
        public int LikeeId { get; set; }

        public Users Liker { get; set; }
        public Users Likee { get; set; }
    }
}