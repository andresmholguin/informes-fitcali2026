import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CreditCard, Drama, DoorOpen, Users,
  BarChart3, Lightbulb, Settings, Plus, X,
} from 'lucide-react';
import { NAV_ITEMS, NAV_BOTTOM } from '@/utils/constants';

const iconMap = {
  LayoutDashboard, CreditCard, Drama, DoorOpen, Users,
  BarChart3, Lightbulb, Settings,
};

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <nav
        className={`
          fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-outline-variant
          flex flex-col py-margin-page px-6 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-on-surface-variant hover:text-primary md:hidden"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="mb-12">
          <div className="flex flex-col items-center gap-2">
            <img
              src="/logo.webp"
              alt="Colboletos - Tu entrada a los mejores eventos"
              width={211}
              height={60}
              className="w-[211px] h-[60px]"
            />

            <div>
              <h1 className="font-headline font-bold text-primary text-[20px] leading-tight">
                Informes
              </h1>
            </div>
          </div>
        </div>

        {/* New Production button */}
        {/* <button className="mb-8 w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-label text-label-caps flex items-center justify-center gap-2 hover:bg-on-primary-fixed-variant transition-colors">
          <Plus size={18} />
          New Production
        </button> */}

        {/* Navigation */}
        <ul className="flex-1 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active' : 'nav-item'
                  }
                >
                  {Icon && <Icon size={20} />}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Bottom nav */}
        <ul className="mt-4 space-y-1">
          {NAV_BOTTOM.map(item => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active' : 'nav-item'
                  }
                >
                  {Icon && <Icon size={20} />}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
