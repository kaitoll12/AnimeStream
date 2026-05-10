import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Dimensions, ScrollView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { Video, ResizeMode } from 'expo-av';
import { COLORS } from '../config';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ route, navigation }: any) {
  const { episode, anime } = route.params;
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentServer, setCurrentServer] = useState<string | null>(null);

  useEffect(() => {
    if (episode) {
      const isPrincipalDrive = episode.videoUrl.includes("drive.google.com") || episode.videoUrl.toLowerCase().includes("drive");
      const driveServers = episode.servers?.filter((s: any) => s.url.includes("drive.google.com") || s.name.toLowerCase().includes("drive")) || [];
      const hasDriveOptions = isPrincipalDrive || driveServers.length > 0;
      
      if (hasDriveOptions && !isPrincipalDrive && driveServers.length > 0) {
        setCurrentServer(driveServers[0].id);
      } else {
        setCurrentServer(null);
      }
    }
  }, [episode]);
  
  // Detectar rotación y modo inmersivo
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const handleOrientation = async (landscape: boolean) => {
      setIsLandscape(landscape);
      if (landscape) {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      } else {
        await NavigationBar.setVisibilityAsync("visible");
      }
    };

    const dim = Dimensions.get('window');
    handleOrientation(dim.width > dim.height);

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      handleOrientation(window.width > window.height);
    });

    return () => {
      subscription?.remove();
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  // Compute video source
  const videoSrc = useMemo(() => {
    if (!currentServer) return episode.videoUrl;
    const server = episode.servers?.find((s: any) => s.id === currentServer);
    return server ? server.url : episode.videoUrl;
  }, [episode, currentServer]);

  // Formatear la URL para que sea un reproductor "embed"
  const getEmbedUrl = (src: string) => {
    let embedSrc = src;
    if (embedSrc.includes("drive.google.com/file/d/")) {
      const id = embedSrc.split("/d/")[1].split("/")[0];
      embedSrc = `https://drive.google.com/file/d/${id}/preview`;
    } else if (embedSrc.includes("youtube.com/watch?v=")) {
      const id = embedSrc.split("v=")[1].split("&")[0];
      embedSrc = `https://www.youtube.com/embed/${id}?autoplay=1`;
    } else if (embedSrc.includes("youtu.be/")) {
      const id = embedSrc.split("youtu.be/")[1].split("?")[0];
      embedSrc = `https://www.youtube.com/embed/${id}?autoplay=1`;
    } else if (embedSrc.includes("streamtape.com/v/")) {
      embedSrc = embedSrc.replace("streamtape.com/v/", "streamtape.com/e/");
    } else if (embedSrc.includes("voe.sx/") && !embedSrc.includes("/e/")) {
      const id = embedSrc.split("voe.sx/")[1].split("?")[0];
      embedSrc = `https://voe.sx/e/${id}`;
    }
    return embedSrc;
  };

  const finalEmbedSrc = getEmbedUrl(videoSrc);

  // Script "Opción Nuclear": Destruye todo el DOM excepto la etiqueta <video>
  const nuclearJS = `
    window.open = function() { return null; };
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    document.getElementsByTagName('head')[0].appendChild(meta);

    const nukeAds = () => {
      document.body.style.backgroundColor = 'black';
      
      const video = document.querySelector('video');
      if (!video) {
        // Streamtape lazy load: hacer click en el overlay falso para que cargue el video
        const playBtn = document.querySelector('.plyr__control--overlaid') || document.querySelector('.play-overlay');
        if (playBtn) playBtn.click();
        return;
      }
      
      // 1. Ocultar absolutamente todos los elementos hijos del body que NO contengan el video
      Array.from(document.body.children).forEach(child => {
        if (!child.contains(video) && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
          child.style.display = 'none';
        }
      });

      // 2. Subir por el árbol familiar del video y ocultar a todos sus "hermanos" (anuncios, overlays, logos)
      let parent = video.parentElement;
      while (parent && parent !== document.body) {
        parent.style.width = '100vw';
        parent.style.height = '100vh';
        parent.style.margin = '0';
        parent.style.padding = '0';
        
        Array.from(parent.children).forEach(sibling => {
          if (sibling !== video && !sibling.contains(video) && sibling.tagName !== 'SCRIPT' && sibling.tagName !== 'STYLE') {
            sibling.style.display = 'none';
          }
        });
        parent = parent.parentElement;
      }

      // 3. Forzar el video a la pantalla completa con controles nativos
      video.setAttribute('controls', 'true');
      video.style.width = '100vw';
      video.style.height = '100vh';
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.zIndex = '2147483647';
      video.style.backgroundColor = 'black';
      video.style.objectFit = 'contain';
      
      // 4. Inmunidad táctil: Evitar que Streamtape procese los toques en el video
      video.onclick = e => e.stopPropagation();
      video.onmousedown = e => e.stopPropagation();
      video.ontouchstart = e => e.stopPropagation();
    };
    
    // Ejecutar el arma nuclear 10 veces por segundo para aniquilar anuncios que aparezcan de la nada
    setInterval(nukeAds, 100);
    true;
  `;

  // Navegación de Episodios
  const episodeIndex = anime.episodes.findIndex((ep: any) => ep.id === episode.id);
  const previousEpisode = episodeIndex > 0 ? anime.episodes[episodeIndex - 1] : null;
  const nextEpisode = episodeIndex < anime.episodes.length - 1 ? anime.episodes[episodeIndex + 1] : null;

  const navigateToEpisode = (targetEpisode: any) => {
    navigation.replace('Player', { episode: targetEpisode, anime: anime });
  };

  return (
    <View style={[styles.container, { paddingTop: isLandscape ? 0 : insets.top }]}>
      <StatusBar hidden={isLandscape} />
      
      {/* 1. Video Player Area (Top) */}
      <View style={isLandscape ? styles.videoWrapperFullscreen : styles.videoWrapper}>
        {isLoading && (
          <View style={[styles.loaderContainer, { zIndex: 99 }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{color: 'white', marginTop: 12, fontWeight: 'bold'}}>Aniquilando anuncios...</Text>
          </View>
        )}

        <WebView 
          key={finalEmbedSrc}
          source={{ uri: finalEmbedSrc }} 
          style={styles.webview}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          setSupportMultipleWindows={false}
          originWhitelist={['*']}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          injectedJavaScript={nuclearJS}
          onLoadEnd={() => setIsLoading(false)}
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url.toLowerCase();
            if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

            // Cortafuegos para redirecciones
            if (request.isTopFrame) {
              if (url.includes('streamtape.com') && !url.includes('/e/')) return false;
              if (url.includes('voe.sx') && !url.includes('/e/')) return false;
            }
            return true;
          }}
        />
      </View>

      {!isLandscape && (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 2. Header / Info */}
          <View style={styles.infoSection}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.animeTitle} numberOfLines={1}>{anime.title}</Text>
              <Text style={styles.episodeTitle}>Episodio {episode.number} {episode.title ? `- ${episode.title}` : ''}</Text>
            </View>
          </View>

          {/* 3. Server Selector */}
          {(() => {
            const isPrincipalDrive = episode.videoUrl.includes("drive.google.com") || episode.videoUrl.toLowerCase().includes("drive");
            const driveServers = episode.servers?.filter((s: any) => s.url.includes("drive.google.com") || s.name.toLowerCase().includes("drive")) || [];
            const hasDriveOptions = isPrincipalDrive || driveServers.length > 0;

            const displayPrincipal = hasDriveOptions ? isPrincipalDrive : true;
            const displayServers = hasDriveOptions ? driveServers : (episode.servers || []);

            if (!displayPrincipal && displayServers.length === 0) return null;

            return (
              <View style={styles.serverSection}>
                <Text style={styles.sectionTitle}>Servidores</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serverScroll}>
                  {displayPrincipal && (
                    <TouchableOpacity
                      style={[styles.serverButton, currentServer === null && styles.serverButtonActive]}
                      onPress={() => { setCurrentServer(null); setIsLoading(true); }}
                    >
                      <Text style={[styles.serverText, currentServer === null && styles.serverTextActive]}>
                        {isPrincipalDrive ? "Google Drive" : "Principal"}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {displayServers.map((server: any) => (
                    <TouchableOpacity
                      key={server.id}
                      style={[styles.serverButton, currentServer === server.id && styles.serverButtonActive]}
                      onPress={() => { setCurrentServer(server.id); setIsLoading(true); }}
                    >
                      <Text style={[styles.serverText, currentServer === server.id && styles.serverTextActive]}>{server.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          })()}

          {/* 4. Navigation Prev/Next */}
          <View style={styles.navButtonsSection}>
            <TouchableOpacity 
              style={[styles.navButton, !previousEpisode && styles.navButtonDisabled]}
              disabled={!previousEpisode}
              onPress={() => previousEpisode && navigateToEpisode(previousEpisode)}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.text} />
              <Text style={styles.navButtonText}>Anterior</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, !nextEpisode && styles.navButtonDisabled]}
              disabled={!nextEpisode}
              onPress={() => nextEpisode && navigateToEpisode(nextEpisode)}
            >
              <Text style={styles.navButtonText}>Siguiente</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* 5. Episode Grid */}
          <View style={styles.episodesGridSection}>
            <Text style={styles.sectionTitle}>Todos los episodios</Text>
            <View style={styles.episodesGrid}>
              {[...anime.episodes].sort((a, b) => a.number - b.number).map((ep: any) => {
                const isActive = ep.id === episode.id;
                return (
                  <TouchableOpacity
                    key={ep.id}
                    style={[styles.gridEpisodeButton, isActive && styles.gridEpisodeButtonActive]}
                    onPress={() => navigateToEpisode(ep)}
                  >
                    <Text style={[styles.gridEpisodeText, isActive && styles.gridEpisodeTextActive]}>
                      {ep.number}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <View style={{ height: 40 }} />

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
    position: 'relative',
    zIndex: 10,
  },
  videoWrapperFullscreen: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999,
  },
  webview: {
    flex: 1,
    backgroundColor: 'black',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: 'black',
  },
  scrollContent: {
    flex: 1,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  animeTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  episodeTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serverSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  serverScroll: {
    gap: 12,
  },
  serverButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  serverButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: COLORS.primary,
  },
  serverText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  serverTextActive: {
    color: COLORS.primary,
  },
  navButtonsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  episodesGridSection: {
    padding: 16,
  },
  episodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridEpisodeButton: {
    width: (width - 32 - 32) / 5, // 5 columns
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  gridEpisodeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  gridEpisodeText: {
    color: COLORS.textMuted,
    fontWeight: 'bold',
    fontSize: 16,
  },
  gridEpisodeTextActive: {
    color: 'white',
  }
});
