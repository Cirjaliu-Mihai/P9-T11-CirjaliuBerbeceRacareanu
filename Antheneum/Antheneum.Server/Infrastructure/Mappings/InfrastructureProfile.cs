using Application.DTOs.Loans;
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

            CreateMap<Book, BookModel>()
                .ForMember(dest => dest.BookId, opt => opt.MapFrom(src => src.Bookid))
                .ForMember(dest => dest.Isbn, opt => opt.MapFrom(src => src.IsbnUniquenumber));

            CreateMap<Bookcopy, BookAvailabilityModel>()
                .ForMember(dest => dest.CopyId, opt => opt.MapFrom(src => src.Copyid))
                .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch.Name));

            CreateMap<Loan, LoanModel>()
                .ForMember(dest => dest.LoanId, opt => opt.MapFrom(src => src.Loanid))
                .ForMember(dest => dest.CopyId, opt => opt.MapFrom(src => src.Copyid))
                .ForMember(dest => dest.ReaderId, opt => opt.MapFrom(src => src.Readerid))
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Copy.Book.Title))
                .ForMember(dest => dest.Isbn, opt => opt.MapFrom(src => src.Copy.Book.IsbnUniquenumber))
                .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Copy.Branch.Name))
                .ForMember(dest => dest.LoanDate, opt => opt.MapFrom(src => src.Loandate))
                .ForMember(dest => dest.DueDate, opt => opt.MapFrom(src => src.Duedate))
                .ForMember(dest => dest.ActualReturnDate, opt => opt.MapFrom(src => src.Actualreturndate));

            CreateMap<LoanModel, LoanDto>();
        }
    }
}
