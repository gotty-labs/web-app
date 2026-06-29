import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarInput,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuSkeleton,
  SidebarSeparator,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Gamepad2Icon, HeartIcon, FolderIcon, PlusIcon, MoreHorizontalIcon } from 'lucide-react'

export const Default = () => (
  <div className="dark bg-background text-foreground p-6">
    <SidebarProvider>
      <Sidebar collapsible="none" className="h-[440px] w-64 rounded-lg border">
        <SidebarHeader>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="font-heading text-base font-semibold">JustGame</span>
            <SidebarTrigger />
          </div>
          <SidebarInput placeholder="Search library…" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Library</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add game">
              <PlusIcon />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Gamepad2Icon />
                    <span>All games</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>128</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <HeartIcon />
                    <span>Wishlist</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="More">
                    <MoreHorizontalIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FolderIcon />
                    <span>Collections</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Favorites</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Backlog</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <SidebarFooter>
          <div className="text-muted-foreground px-2 py-1 text-xs">
            Signed in as ShadowPlayer
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  </div>
)
