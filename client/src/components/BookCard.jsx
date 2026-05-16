import { Link } from 'react-router-dom';
import { conditionLabel, formatMoney } from '../utils/format';

export default function BookCard({ book }) {
  const img = book.images?.[0];
  const cat = book.category?.name;

  return (
    <article className="card">
      <Link to={`/book/${book._id}`} className="card-cover">
        {img ? <img src={img} alt="" loading="lazy" /> : <span aria-hidden="true">📖</span>}
      </Link>
      <div className="card-body">
        <h2 className="card-title">
          <Link to={`/book/${book._id}`}>{book.title}</Link>
        </h2>
        <p className="card-meta">
          {book.author}
          {cat ? ` · ${cat}` : ''}
        </p>
        <div className="badges">
          <span className="badge badge-condition">{conditionLabel(book.condition)}</span>
          {book.isAvailableForExchange ? <span className="badge badge-exchange">Exchange OK</span> : null}
        </div>
        <div className="price-row">
          <span className="price">{formatMoney(book.price)}</span>
          <Link to={`/book/${book._id}`} className="btn btn-primary btn-sm">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
