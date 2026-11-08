namespace ProjectLibrary.Entities.Concrete
{
    public static class LibraryConstants
    {
        public static class Roles
        {
            public const string Admin = "Admin";
            public const string User = "User";
        }

        public static class BorrowStatus
        {
            public const string Borrowed = "Borrowed";
            public const string Returned = "Returned";
            public const string Overdue = "Overdue";
        }

        public static class ReservationStatus
        {
            public const string Pending = "Pending";
            public const string Approved = "Approved";
            public const string Declined = "Declined";
            public const string Completed = "Completed";
            public const string Cancelled = "Cancelled";
            public const string IsNotified = "IsNotified";
        }

        public static class ExtensionStatus
        {
            public const string Pending = "Pending";
            public const string Approved = "Approved";
            public const string Declined = "Declined";
        }
    }
}
