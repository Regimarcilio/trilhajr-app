# 📱 TrilhaJr - Guia de Instalação v1.0.0

![Banner](https://trilhajr.com/assets/banner.png)

## 🎯 O que é o TrilhaJr?

Otimizador de currículos para o mercado brasileiro. Converta seu PDF em currículo ATS-ready em 30 segundos!

---

## 🚀 Como Instalar

### 📦 Option 1: App Store / Play Store (Recomendado)

**Android - Play Store**
```
play.google.com/store/apps/details?id=com.trilhajr.app
```

**iOS - App Store**
```
apps.apple.com/app/trilhajr/idxxxxxxxx
```

### 📥 Option 2: APK / IPA Direto

**Android APK (Debug - para testes)**
```bash
# Download
curl -L -o trilhajr.apk "https://trilhajr.com/download/trilhajr.apk"

# Instalar via ADB
adb install trilhajr.apk
```

**iOS IPA (TestFlight)**
```bash
# 1. Instalar TestFlight
# 2. Solicitar acesso: beta@trilhajr.app
# 3. Instalar versão beta
```

### 🌐 Option 3: Expo Go (Mais Rápido!)

**Passo a passo:**
1. Instale **Expo Go** (grátis) na Play Store/App Store
2. Acesse: **https://expo.dev/@trilhajr/trilhajr**
3. Escaneie o QR Code abaixo
4. Pronto! O app abre automaticamente

```
┌─────────────────────────────────┐
│        📱 QR CODE AQUI          │
│    scan with Expo Go app        │
└─────────────────────────────────┘
```

### 🌍 Option 4: Web (PWA)

Acesse diretamente no navegador:
```
https://trilhajr.com
```

Instale como PWA:
1. Abra no Chrome/Firefox/Edge
2. Clique no ícone "Instalar" na barra superior
3. Adicione à tela inicial

---

## 🔧 Para Desenvolvedores

### Pré-requisitos
```bash
- Node.js 20+ (https://nodejs.org)
- npm 10+ (já vem com Node)
- Expo CLI: npm install -g expo-cli
- EAS CLI: npm install -g eas-cli
```

### Instalação Local
```bash
# 1. Clonar
git clone https://github.com/Regimarcilio/trilhajr-app.git
cd trilhajr-app/mobile-app

# 2. Instalar dependências
npm install

# 3. Iniciar em modo desenvolvimento
npx expo start
```

### Build de Produção (EAS)

```bash
# Login no EAS
npx eas login

# Configurar credenciais
npx eas credentials --platform [android|ios]

# Build Android
npx eas build --platform android --profile production

# Build iOS  
npx eas build --platform ios --profile production

# Subir para lojas
npx eas submit --platform [android|ios]
```

### Configuração Expo

```bash
# Projeto EAS ID
trilhajr-project-id

# Bundle IDs
Android: com.trilhajr.app
iOS: com.trilhajr.app

# Versão atual
v1.0.0 (Build 1)
```

---

## 📋 Especificações

### Android
- **Mínimo SDK**: API 23 (Android 6.0)
- **Alvo SDK**: API 34 (Android 14)
- **Formato**: AAB (App Bundle)
- **Tamanho**: 15-25 MB

### iOS
- **Deployment Target**: iOS 13.0+
- **Formato**: IPA
- **Tamanho**: 20-30 MB
- **Devices**: iPhone, iPad Universal

### Web
- **Progressive Web App**
- **Offline Support**
- **Instalação como app**

---

## 🔗 Links Úteis

| Tipo | Link |
|------|------|
| **App Store** | `apps.apple.com/app/trilhajr` (em breve) |
| **Play Store** | `play.google.com/store/apps/details?id=com.trilhajr.app` (em breve) |
| **Expo Go** | `https://expo.dev/@trilhajr/trilhajr` |
| **Web App** | `https://trilhajr.com` |
| **Download APK** | `https://trilhajr.com/download` |
| **Documentação** | `docs.trilhajr.app` |
| **Suporte** | `suporte@trilhajr.app` |

---

## ❓ FAQ

**Q: Preciso de login/senha?**
A: Não! Pague com Pix/Cartão e receba seu PDF instantaneamente.

**Q: Funciona em Android e iOS?**
A: Sim! Build nativo para ambas as plataformas.

**Q: Preciso internet?**
A: Apenas para upload do PDF e checkout. O app funciona offline depois.

**Q: Vale a pena o investimento?**
A: Sim! 75% de currículos são rejeitados por ATS mal formatados.

---

## 🆘 Problemas Comuns

### Expo Go não abre
```bash
1. Verifique internet
2. Reinicie Expo Go
3. Tente: npx expo start --clear
```

### Build falha no EAS
```bash
npx expo doctor  # Diagnóstico
eas build --clear  # Limpa cache
```

### APK não instala
```bash
Desbloqueie instalação de apps desconhecidos nas opções do Android
```

## 📞 Suporte

- **Email**: suporte@trilhajr.app
- **WhatsApp**: +55 11 99999-9999
- **GitHub Issues**: https://github.com/Regimarcilio/trilhajr-app/issues

---

© 2026 TrilhaJr - Seu currículo otimizado para ATS!