import { Outlet } from 'react-router-dom'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import CartDrawer from '../components/cart/CartDrawer'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
        </div>
    )
}
