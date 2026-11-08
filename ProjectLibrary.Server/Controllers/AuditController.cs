using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectLibrary.Business.Services.Abstract;
using ProjectLibrary.Core.Common;

namespace ProjectLibrary.Server.Controllers
{
    [Route("api/audit")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentLogs([FromQuery] int count = 50)
        {
            var logs = await _auditService.GetRecentLogsAsync(count);
            return Ok(ApiResponse<object>.SuccessResult(logs));
        }
    }
}
