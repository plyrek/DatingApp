using System;

namespace DatingApp.API.Dtos
{
    public class UserForListDTO
    {
        public int ID { get; set; }
        
        public string Username { get; set; }
        
        public string Gender { get; set; }

        public int Age { get; set; }

        public string KnowAs { get; set; }

        public DateTime Created { get; set; }

        public DateTime LastActive { get; set; }

        public string City { get; set; }

        public string Country { get; set; }

        public string PhotoUrl { get; set; }

    }
}