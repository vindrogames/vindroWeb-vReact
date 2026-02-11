import { useParams } from 'react-router-dom';

export default function UserTopScores() {
  const { userName } = useParams();

  return (
    <div>
      <h1>Brackets for {userName}</h1>
      {/* Fetch data based on userName */}
    </div>
  );
}