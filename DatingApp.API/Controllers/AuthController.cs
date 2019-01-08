using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public AuthController(IAuthRepository repo, IConfiguration config, IMapper mapper)
        {
            _config = config;
            _mapper = mapper;
            _repo = repo;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserForRegister userForRegister)
        {
            // validate request

            userForRegister.username = userForRegister.username.ToLower();

            if (await _repo.UserExists(userForRegister.username))
            {
                return BadRequest("Username already exists");
            }

            // This code was used before we automapped the RegisterForUser DTO to the User Database 
                //var userToCreate = new Users
                 // {
                //     Username = userForRegister.username
                // };

            // Now we can use the auto mapper for this function
            var userToCreate = _mapper.Map<Users>(userForRegister);

            var createdUser = await _repo.Register(userToCreate, userForRegister.password);

            // Creates a user to return that does not contain the password.
            var userToReturn = _mapper.Map<UserForDetailedDto>(createdUser);

            // This was a security workaround that was used as a cheat during early stages of development
                // return StatusCode(201);
            
            // This is the final solution which uses a location header
            return CreatedAtRoute("GetUser", new {controller = "Users", id = createdUser.ID}, userToReturn);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserForLoginDto userForLoginDto)
        {
            // throw new System.Exception("Computer says no!");

            var userFromRepo = await _repo.Login(userForLoginDto.Username.ToLower(), userForLoginDto.Password);

            if (userFromRepo == null)
                return Unauthorized();

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userFromRepo.ID.ToString()),
                new Claim(ClaimTypes.Name, userFromRepo.Username)
            };

            //Look in appaettings.json for the App Token. In production the key should be a long randomly generated string
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("AppSettings:Token").Value));
            
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = System.DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);

            var user = _mapper.Map<UserForListDTO>(userFromRepo);

            return Ok(new {
                token = tokenHandler.WriteToken(token),
                user
            });
        }

    }
}