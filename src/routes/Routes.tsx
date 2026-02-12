import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import Panel from "../pages/Panel"
import ProjectsPage from "../pages/Projects"
import ProjectDetail from "../pages/ProjectDetail"
import NominaPage from "../pages/NominaPage"
import ClientsPage from "../pages/Clients"
import EmployeeDetailPage from "../pages/EmployeeDetailPage"
import PaymentsPage from "../pages/PaymentsPage"


export default function AppRoutes() {
    return (

        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/panel" element={<Panel />} />
                <Route path="/proyectos" element={<ProjectsPage />} />
                <Route path="/proyectos/:id" element={<ProjectDetail />} />
                <Route path="/nomina" element={<NominaPage />} />
                <Route path="/nomina/pagos" element={<PaymentsPage />} />
                <Route path="/clientes" element={<ClientsPage />} />
                <Route path="/empleados/:id" element={<EmployeeDetailPage />} />

            </Routes>
        </BrowserRouter>
    )
}
