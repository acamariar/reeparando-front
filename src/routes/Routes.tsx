import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import ProjectsPage from "../pages/Projects"
import ProjectDetail from "../pages/ProjectDetail"
import NominaPage from "../pages/NominaPage"
import ClientsPage from "../pages/Clients"
import EmployeeDetailPage from "../pages/EmployeeDetailPage"
import PaymentsPage from "../pages/PaymentsPage"
import ColaboradoresPage from "../pages/ColaboradoresPage"
import ColaboradorDetail from "../pages/ColaboradorDetail"
import GananciasPage from "../pages/Reportes"
import ComprasPage from "../pages/ComprasPage"
import ComprasReportPage from "../pages/ComprasReportPage"
import GananciaPage from "../pages/ReporteTotal"
import SeguimientosPage from "../pages/SeguimientosPage"


export default function AppRoutes() {
    return (

        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/panel" element={<ProjectsPage />} />
                <Route path="/proyectos" element={<ProjectsPage />} />
                <Route path="/proyectos/:id" element={<ProjectDetail />} />
                <Route path="/nomina" element={<NominaPage />} />
                <Route path="/nomina/pagos" element={<PaymentsPage />} />
                <Route path="/clientes" element={<ClientsPage />} />
                <Route path="/empleados/:id" element={<EmployeeDetailPage />} />
                <Route path="/seguimientos/facturacion" element={<SeguimientosPage />} />
                <Route path="/colaboradores" element={<ColaboradoresPage />} />
                <Route path="/colaboradores/:id" element={<ColaboradorDetail />} />
                <Route path="/seguimientos/reporte" element={<GananciasPage />} />
                <Route path="/compras/facturacion" element={<ComprasPage />} />
                <Route path="/compras/reporte" element={<ComprasReportPage />} />
                <Route path="/ventas/gananciales" element={<GananciaPage />} />
            </Routes>
        </BrowserRouter>
    )
}
