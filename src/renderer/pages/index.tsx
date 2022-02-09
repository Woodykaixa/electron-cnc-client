import { FC, ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router';
import { toBase64 } from '@common/utils';

const { callMain } = window.bridge;
const Background = styled.img`
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  position: absolute;
  z-index: -10;
  object-fit: cover;
`;

const setLoadingScreenByConfig = async () => {
  const config = await callMain('get-configuration');
  const activeThemePath = await callMain('path-join', config.constants.ThemeDir, config.dynamic!.defaultTheme ?? '');
  const bgPath = await callMain('path-join', activeThemePath, './loadingscreen.png');
  const backgroundUrl =
    (await callMain('request-local-file', bgPath)
      .then(buffer => toBase64(new Blob([buffer])))
      .catch(() => {})) ?? '';
  let loadingNode: ReactNode;
  if (
    !config.dynamic ||
    !config.dynamic!.loading ||
    (!config.dynamic!.loading.text && !config.dynamic!.loading.image)
  ) {
    return {
      backgroundUrl,
      loadingNode,
    };
  }
  const { loading } = config.dynamic;

  if (loading.image) {
    const loadingImageUrl = await window.bridge
      .callMain('request-local-file', activeThemePath + '/' + loading.image)
      .then(buffer => toBase64(new Blob([buffer])))
      .catch(() => {});
    loadingNode = <img src={loadingImageUrl ?? ''} alt={loading.text ?? 'loading'} style={loading.style} />;
  } else {
    loadingNode = <div style={loading.style}>{loading.text}</div>;
  }
  return {
    backgroundUrl,
    loadingNode,
  };
};

export const Index: FC = () => {
  const [bg, setBg] = useState('');
  const [loading, setLoading] = useState<ReactNode>('loading');
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate('/client', {
        replace: true,
      });
    }, 2000);
  }, [navigate]);

  useEffect(() => {
    setLoadingScreenByConfig().then(config => {
      setBg(config.backgroundUrl);
      if (config.loadingNode) {
        setLoading(config.loadingNode);
      }
    });
  }, []);
  return (
    <div>
      {loading}
      <Background src={bg} alt='loading' />
    </div>
  );
};
