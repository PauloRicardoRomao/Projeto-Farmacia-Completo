
import { router } from 'expo-router';
import { StyleSheet, View, TouchableOpacity, Image, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={require('../../../assets/LogoFarm.fw.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.acaoHeader}>
            <TouchableOpacity style={styles.buttonIcone} accessibilityLabel="Notificações">
              <Ionicons name="notifications-outline" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonPerfil} onPress={() => router.push('/(tabs)/empresa/perfil')} accessibilityLabel="Perfil do usuário">
              <Ionicons name="person-circle-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tituloSessao}>
          <Text style={styles.tituloPrincipal}>DashBoard - Operacional</Text>
          <Text style={styles.subTitulo}>Instituição - Farmaceutico</Text>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardItem1}>
            <Image
              source={require('../../../assets/prancheta.png')}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>Receitas Aguardando Aprovação</Text>
            <Text style={styles.cardNumber}>0</Text>
          </View>

          <View style={styles.cardItem2}>
            <Image
              source={require('../../../assets/box.png')}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>Doações Pendentes Triagem</Text>
            <Text style={styles.cardNumber}>0</Text>
          </View>

          <View style={styles.cardItem3}>
            <Image
              source={require('../../../assets/remedio.png')}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>Remédios com Validade Curta</Text>
            <Text style={styles.cardNumber}>0</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Atividades Recentes</Text>
          
          <View style={styles.cardAtividades}>
            <View style={styles.iconAtividades}>
              <Ionicons name="checkmark-circle" size={24} color="#72CAA5" />
            </View>
            <View style={styles.atividadeInfos}>
              <Text style={styles.atividadeTexto}>Receita aprovada - Paciente XYZ</Text>
              <Text style={styles.atividadeHora}>Há 2 horas</Text>
            </View>
          </View>

          <View style={styles.cardAtividades}>
            <View style={styles.iconAtividades}>
              <Ionicons name="alert-circle" size={24} color="#E6AF0A" />
            </View>
            <View style={styles.atividadeInfos}>
              <Text style={styles.atividadeTexto}>Doação aguardando triagem</Text>
              <Text style={styles.atividadeHora}>Há 4 horas</Text>
            </View>
          </View>

          <View style={styles.cardAtividades}>
            <View style={styles.iconAtividades}>
              <Ionicons name="warning" size={24} color="#E60A0A" />
            </View>
            <View style={styles.atividadeInfos}>
              <Text style={styles.atividadeTexto}>Medicamento com validade próxima</Text>
              <Text style={styles.atividadeHora}>Há 6 horas</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Triagem de Receitas</Text>
          
          <View style={styles.triageCard}>
            <View style={styles.triageHeader}>
              <Text style={styles.triageTitulo}>Receita #001</Text>
              <View style={[styles.triageEstado, { backgroundColor: '#E6AF0A' }]}>
                <Text style={styles.triageEstadoText}>Pendente</Text>
              </View>
            </View>
            <Text style={styles.triageInfo}>Paciente: João Silva</Text>
            <Text style={styles.triageInfo}>Data: 25/05/2026</Text>
            <View style={styles.triageAcao}>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#72CAA5' }]}>
                <Text style={styles.triageButtonText}>Aprovar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.triageButton, { backgroundColor: '#E60A0A' }]}>
                <Text style={styles.triageButtonText}>Rejeitar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
              style={[styles.triageButton, 
              { backgroundColor: '#0a6de6' },
              ]}>
                <Ionicons name="information-circle-outline" size={18} color="#fff" />
                <Text style={styles.triageButtonText}>Detalhes</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.triageCard}>
            <View style={styles.triageHeader}>
              <Text style={styles.triageTitulo}>Receita #002</Text>
              <View style={[styles.triageEstado, { backgroundColor: '#72CAA5' }]}>
                <Text style={styles.triageEstadoText}>Aprovada</Text>
              </View>
            </View>
            <Text style={styles.triageInfo}>Paciente: Maria Santos</Text>
            <Text style={styles.triageInfo}>Data: 24/05/2026</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 100,
        backgroundColor: '#72CAA5',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },
    logo: {
        width: 200,
        height: 80,
    },
    acaoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonIcone: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPerfil: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    tituloSessao: {
        marginLeft: 25,
        marginTop: 20,
        marginBottom: 20,
    },
    tituloPrincipal: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
    },
    subTitulo: {
        fontSize: 18,
        color: '#666',
        marginTop: 4,
    },
    cardInfo: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        gap: 10,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    cardItem1: {
        width: '31%',
        height: 180,
        backgroundColor: 'rgb(68, 179, 105)',
        padding: 10,
        borderRadius: 15,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardItem2: {
        width: '31%',
        height: 180,
        backgroundColor: 'rgb(230, 175, 10)',
        padding: 10,
        borderRadius: 15,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardItem3: {
        width: '31%',
        height: 180,
        backgroundColor: 'rgb(230, 10, 10)',
        padding: 10,
        borderRadius: 15,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        width: 50,
        height: 50,
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardNumber: {
        fontSize: 25,
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionContainer: {
        marginHorizontal: 20,
        marginTop: 30,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    cardAtividades: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center',
    },
    iconAtividades: {
        marginRight: 15,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    atividadeInfos: {
        flex: 1,
    },
    atividadeTexto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    atividadeHora: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    triageCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    triageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    triageTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    triageEstado: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    triageEstadoText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    triageInfo: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    triageAcao: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    triageButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    triageButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        
    },
});
