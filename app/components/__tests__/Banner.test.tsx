import { render, screen } from '@testing-library/react'
import { Banner } from '../Banner'


describe('Banner', () => {
  it('renders the banner with correct text content', () => {
    render(<Banner />)
    
    // Check if the main heading is present
    expect(screen.getByText('Welcome to Our Blog')).toBeInTheDocument()
    
    // Check if the subtext is present
    expect(screen.getByText('Discover stories, thinking, and expertise')).toBeInTheDocument()
  })

  it('has the correct background gradient classes', () => {
    const { container } = render(<Banner />)
    
    const bannerElement = container.firstChild as HTMLElement
    expect(bannerElement).toHaveClass(
      'bg-gradient-to-r',
      'from-purple-600',
      'to-blue-600'
    )
  })

  it('has the correct layout structure', () => {
    const { container } = render(<Banner />)
    
    // Check for overlay div
    expect(container.querySelector('.opacity-50')).toBeInTheDocument()
    
    // Check for content wrapper with correct z-index
    expect(container.querySelector('.z-10')).toBeInTheDocument()
  })
}) 