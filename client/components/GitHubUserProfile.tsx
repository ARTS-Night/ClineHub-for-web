import React, { useEffect, useState } from 'react';

// APIから返ってくるデータの型定義
type UserProfile = {
  login: string;
  avatar_url: string;
  html_url: string;
};

export const GitHubUserProfile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('https://api.github.com/users/ARTS-Night')
      .then((res) => res.json())
      .then((data: UserProfile) => {
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch user:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Failed to load user.</div>;

  return (
    <a
      href={user.html_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        color: 'inherit',
        fontWeight: 'bold',
      }}
    >
      <img
        src={user.avatar_url}
        alt={user.login}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
        }}
      />
      <span>{user.login}</span>
    </a>
  );
};