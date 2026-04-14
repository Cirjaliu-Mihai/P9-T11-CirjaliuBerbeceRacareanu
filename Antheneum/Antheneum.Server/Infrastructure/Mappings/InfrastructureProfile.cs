using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence.Models;

namespace Infrastructure.Mappings
{
    public class InfrastructureProfile : Profile
    {
        public InfrastructureProfile()
        {
            CreateMap<User, UserModel>()
                .ConstructUsing((src, _) => UserModel.Reconstitute(
                    src.Userid,
                    src.Username,
                    src.Passwordhash,
                    src.Email,
                    src.Administrators != null && src.Administrators.Any()
                        ? Role.Administrator
                        : Role.Reader,
                    src.Phone,
                    src.Address))
                .ForAllMembers(opt => opt.Ignore());
        }
    }
}
