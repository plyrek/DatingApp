namespace DatingApp.API.Extensions
{
    public class UserParams
    {
        public int UserId { get; set; }
        public string Gender { get; set; }
        public int MinAge { get; set; } = 18;
        public int MaxAge { get; set; } = 99;
        public bool Likees { get; set; } = false;
        public bool Likers { get; set; } = false;
        private const int MaxPageSize = 50;
        public string OrderBy { get; set; }
        public int PageNumber { get; set; } = 1;
        private int pageSize = 10;
        public int PageSize
        {
            get { return pageSize;}
            set { pageSize = (value > MaxPageSize) ? MaxPageSize : value;}
        }

        
    }
}