using Microsoft.EntityFrameworkCore;
using ProjectLibrary.Core.Abstraction;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace ProjectLibrary.Core.DataAccess.EntityFramework
{
    public class EFEntityRepositoryBase<TEntity, TContext> :
     IEntityRepository<TEntity>
     where TEntity : class, IEntity, new()
     where TContext : DbContext

    {
        private readonly TContext _context;

        public EFEntityRepositoryBase(TContext context)
        {
            _context = context;
        }

        public async Task Add(TEntity entity)
        {
            var addEntity = _context.Entry(entity);
            addEntity.State = EntityState.Added;
            await _context.SaveChangesAsync();
        }

        public async Task Delete(TEntity entity)
        {
            var deleteEntity = _context.Entry(entity);
            deleteEntity.State = EntityState.Deleted;
            await _context.SaveChangesAsync();
        }
        public async Task Update(TEntity entity)
        {
            var updateEntity = _context.Entry(entity);
            updateEntity.State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task<TEntity> Get(Expression<Func<TEntity, bool>> filter)
        {
            return await _context.Set<TEntity>().FirstOrDefaultAsync(filter);
        }

        public async Task<List<TEntity>> GetCollection(Expression<Func<TEntity, bool>> filter = null)
        {
            if (filter is null)
            {
                return await _context.Set<TEntity>().ToListAsync();
            }
            return await _context.Set<TEntity>().Where(filter).ToListAsync();
        }

    }
}
