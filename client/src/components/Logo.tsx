import LogoPng from '../../public/assets/Logo2.png'
type IProps = {
    height?: number;
}
export const Logo = (props: IProps) => {
    return (
        <img src={LogoPng} className="h-36 w-auto object-contain" alt="Logo"
            style={{height: props.height ? props.height + 'px' : undefined }}
        />
    )
}