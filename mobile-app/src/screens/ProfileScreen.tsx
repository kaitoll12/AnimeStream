import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { COLORS, API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, loading, logout, checkSession } = useAuth();
  
  // Form State
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const menuItems = [
    { icon: 'list', title: 'Mi Lista', subtitle: 'Series y películas guardadas' },
    { icon: 'time-outline', title: 'Historial', subtitle: 'Continuar viendo' },
    { icon: 'settings-outline', title: 'Configuración', subtitle: 'Cuenta y reproductor' },
    { icon: 'help-circle-outline', title: 'Ayuda', subtitle: 'Soporte técnico' },
  ];

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !username)) {
      setError("Por favor completa todos los campos.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      if (!isLogin) {
        // Register first
        const regRes = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });
        const regData = await regRes.json();
        
        if (!regRes.ok) {
          setError(regData.error || "Error al registrarse");
          setIsSubmitting(false);
          return;
        }
      }

      // Login using custom mobile endpoint
      const logRes = await fetch(`${API_URL}/api/mobile/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const logData = await logRes.json();

      if (!logRes.ok) {
        setError(logData.error || "Error al iniciar sesión");
      } else if (logData.session_token) {
        await checkSession(logData.session_token);
        setShowLoginForm(false);
        // Reset form
        setEmail("");
        setPassword("");
        setUsername("");
      }
    } catch (e) {
      setError("Error de conexión con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const returnUrl = Linking.createURL('login');
      const authUrl = `${API_URL}/mobile-google?returnUrl=${encodeURIComponent(returnUrl)}`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const sessionToken = parsed.queryParams?.session_token;
        if (sessionToken && typeof sessionToken === 'string') {
          await checkSession(sessionToken);
          setShowLoginForm(false);
        } else {
          setError("No se pudo obtener la sesión de Google.");
        }
      } else if (result.type !== 'cancel') {
        setError("Error al iniciar sesión con Google.");
      }
    } catch (e: any) {
      setError(`Error: ${e?.message || 'No se pudo abrir el navegador'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showLoginForm) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowLoginForm(false)} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.formTitle}>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</Text>
          
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de Usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre ninja"
                placeholderTextColor={COLORS.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.submitButtonText}>{isLogin ? "Entrar" : "Registrarse"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={() => { setIsLogin(!isLogin); setError(""); }}>
            <Text style={styles.switchButtonText}>
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={isSubmitting}>
            <Ionicons name="logo-google" size={20} color="white" style={{ marginRight: 10 }} />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 20 }]} showsVerticalScrollIndicator={false}>
      
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user?.image || 'https://api.dicebear.com/7.x/notionists/png?seed=Aniflex' }} 
            style={styles.avatar} 
          />
        </View>
        
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
        ) : user ? (
          <>
            <Text style={styles.username}>{user.name || 'Usuario'}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.username}>Modo Invitado</Text>
            <Text style={styles.email}>Inicia sesión para guardar favoritos</Text>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: COLORS.primary }]}
              onPress={() => setShowLoginForm(true)}
            >
              <Text style={[styles.editButtonText, { color: 'white' }]}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name={item.icon as any} size={24} color={COLORS.text} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      {user && (
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      )}
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  username: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 16,
    gap: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalHeader: {
    height: 60,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    padding: 24,
  },
  formTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    color: 'white',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#34d399',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchButtonText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: COLORS.textMuted,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
