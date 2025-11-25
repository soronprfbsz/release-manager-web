import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Package, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/widgets/theme-toggle/ui/ThemeToggle'
import { useAuth } from '@/app/providers/AuthProvider'
import { menuItems } from '../model/menuItems'
import { ROUTES } from '@/shared/config/constants'

export function NavigationBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="font-bold text-lg">Release Manager</span>
          </Link>

          <nav className="flex items-center gap-1">
            {menuItems.map((item) => (
              <div
                key={item.label}
                onMouseEnter={() => item.children && setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                {item.children ? (
                  <Popover open={openMenu === item.label}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="gap-1">
                        {item.label}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.path!}
                          className="block px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={() => setOpenMenu(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Button variant="ghost" asChild>
                    <Link to={item.path!}>{item.label}</Link>
                  </Button>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.accountName}
            </span>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">로그아웃</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
